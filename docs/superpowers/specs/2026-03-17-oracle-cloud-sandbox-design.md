# Oracle Cloud Free Tier Sandbox — Design Spec

**Date:** 2026-03-17
**Status:** Approved

## Overview

Deploy the `myapp` monorepo to an Oracle Cloud Free Tier ARM A1 compute instance as a pre-production sandbox environment for penetration testing. The sandbox runs Docker Swarm (single-node) and is deployed via a `staging` branch. Network access is default-deny and opened per pen test engagement via a GitHub Actions workflow. HTTP only (no TLS) — pen tests deliberately target the unencrypted surface.

---

## Architecture

### Compute

- **Platform:** Oracle Cloud Free Tier, ARM Ampere A1
- **Shape:** `VM.Standard.A1.Flex` — 2 OCPU, 12 GB RAM (half the free allowance; leaves headroom)
- **OS:** Ubuntu 22.04 (ARM64)
- **Orchestration:** Docker Swarm, single-node manager

### Services (Swarm Stack)

Reuses existing `docker-stack.yml` (single-node, no placement constraints). The `IMAGE` variable convention will be updated to match `docker-stack.prod.yml` — using `ghcr.io/${GITHUB_REPOSITORY}` with a separate `TAG` variable, instead of the current combined `${IMAGE}:${TAG}`.

| Service | Image | Replicas |
|---------|-------|----------|
| `app` | `ghcr.io/<org>/myapp:staging-latest` | 1 |
| `db` | `postgres:16-alpine` | 1 |
| `nginx` | `nginx:alpine` | 1 |

Swarm secrets (`postgres_user`, `postgres_password`, `postgres_db`) created on the manager node via SSH during initial provisioning. Postgres data persisted in a named volume (`db_data`).

### Networking

- OCI VCN (`10.0.0.0/16`), public subnet (`10.0.1.0/24`), internet gateway
- **Security List** for subnet-level rules (default-deny all inbound)
- **Network Security Group (NSG)** attached to the instance for dynamic pen-test access rules — NSG supports additive `add-security-rules` / `remove-security-rules` OCI CLI commands, avoiding the replace-all footgun of Security List updates
- SSH (port 22): open to `0.0.0.0/0` with key-only authentication (GitHub Actions runner IPs are dynamic and change frequently; key auth is the security control)
- HTTP (80): closed by default; opened/closed per IP via `sandbox-access.yml` using NSG rules
- HTTPS (443): not configured — nginx listens on port 80 only; pen tests target the HTTP surface intentionally
- Additional pen-test ports: opened/closed per IP via `sandbox-access.yml` as needed

### Terraform State

Stored in an OCI Object Storage bucket. The bucket must be created as a one-time bootstrap step before the first `terraform init` — see Operational Runbook. The bucket name and namespace are configured in `backend.tf`.

---

## Docker Images

`deploy-sandbox.yml` builds `linux/arm64` only (the OCI A1 instance is ARM; building amd64 adds unnecessary QEMU overhead):

- **Platform:** `linux/arm64`
- **Sandbox tags:** `staging-sha-{SHA}`, `staging-latest`

`ci.yml` (PR testing) is updated to build `linux/amd64,linux/arm64` so the staging image is also testable on x86 CI runners. This requires adding a `docker/setup-buildx-action` step (pinned to full SHA) and a `platforms:` key to the existing `docker/build-push-action` step. Note: arm64 emulation via QEMU will increase CI build time on PRs.

Prod `deploy.yml` image tags are unchanged (`sha-{SHA}`, `latest`).

---

## Repository Structure

### New files

```
infra/
├── main.tf                    # OCI provider, VCN, subnet, internet gateway, route table
├── compute.tf                 # A1 instance; cloud-init installs Docker CE (ARM64), inits Swarm
├── security.tf                # Security List (SSH open), NSG (pen-test rules, default empty)
├── storage.tf                 # (omitted — state bucket is bootstrapped manually; no app-level storage needed)
├── outputs.tf                 # instance_public_ip, nsg_ocid, security_list_ocid
├── variables.tf               # region, compartment_ocid, ssh_public_key, shape config
├── backend.tf                 # OCI Object Storage remote state config
└── terraform.tfvars.example   # Committed template; real values supplied via CI secrets

.github/workflows/
├── deploy-sandbox.yml         # Push to staging → build arm64 image → deploy to OCI Swarm
├── sandbox-access.yml         # workflow_dispatch: open/close NSG rules for pen test
└── infra.yml                  # workflow_dispatch: tofu apply / destroy
```

### Modified files

| File | Change |
|------|--------|
| `docker-stack.yml` | Update image line to `ghcr.io/${GITHUB_REPOSITORY:-your-org/myapp}:${TAG:-latest}` to match prod convention and remove the `IMAGE` variable |
| `.github/workflows/ci.yml` | Add `docker/setup-buildx-action` step (SHA-pinned); add `platforms: linux/amd64,linux/arm64` to the `docker/build-push-action` step |
| `AGENTS.md` | Document sandbox environment, workflows, and secrets |

### Existing files used unchanged

- `docker-stack.prod.yml` — multi-node prod stack (untouched)
- `nginx/nginx.conf` — copied to VM by deploy workflow before `stack deploy`

---

## GitHub Actions Workflows

### `deploy-sandbox.yml`

**Trigger:** Push to `staging` branch
**Path filter:** `app/**`, `docker-stack.yml`, `nginx/**`, `.github/workflows/deploy-sandbox.yml`

**Steps:**
1. Checkout
2. Login to GHCR
3. `docker/setup-buildx-action` (SHA-pinned)
4. Build + push — platform `linux/arm64`, tags: `staging-sha-{SHA}`, `staging-latest`
5. `scp nginx/nginx.conf` → `ubuntu@$SANDBOX_HOST:~/myapp/nginx/nginx.conf`
6. `scp docker-stack.yml` → `ubuntu@$SANDBOX_HOST:~/myapp/docker-stack.yml`
7. SSH into VM:
   ```bash
   cd ~/myapp && \
   GITHUB_REPOSITORY=${{ github.repository }} TAG=staging-latest \
   docker stack deploy -c docker-stack.yml myapp --with-registry-auth
   ```
   Note: `cd ~/myapp` is required so that Docker resolves the `./nginx/nginx.conf` bind-mount relative to the correct directory. `GITHUB_REPOSITORY` must be explicitly exported because the SSH session does not inherit the GitHub Actions environment — without it, the image reference falls back to the placeholder `ghcr.io/your-org/myapp`.

**Secrets used:** `GITHUB_TOKEN` (GHCR), `SANDBOX_HOST`, `SANDBOX_SSH_KEY`

---

### `sandbox-access.yml`

**Trigger:** `workflow_dispatch`

**Inputs:**

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `action` | choice (`open`/`close`) | yes | — | Add or remove NSG rules |
| `ip` | string | yes | — | CIDR to allow, e.g. `203.0.113.5/32` |
| `ports` | string | no | `80` | Comma-separated ports |

**Steps:**
1. Install OCI CLI
2. Configure OCI CLI credentials from secrets
3. For `open`: `oci network nsg rules add` — one rule per port, TCP ingress from `ip`
4. For `close`: `oci network nsg rules remove` — fetch current rules, filter by source IP and ports, delete matching rule IDs

Using NSG (`oci network nsg rules add/remove`) rather than Security List (`oci network security-list update`) because NSG commands are additive — they do not replace the full rule set, so multiple concurrent open calls are safe.

**Secrets used:** `OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`, `OCI_PRIVATE_KEY`, `OCI_REGION`, `OCI_NSG_OCID`

---

### `infra.yml`

**Trigger:** `workflow_dispatch`

**Inputs:**

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | choice (`apply`/`destroy`) | yes | Provision or tear down |

**Steps:**
1. Checkout
2. Setup OpenTofu
3. Write OCI private key from secret to temp file (e.g. `/tmp/oci_key.pem`); cleanup with `rm -f` in a final `always:` step — GitHub-hosted runners are ephemeral so the risk is low, but the cleanup is explicit
4. `tofu init` (OCI Object Storage backend — bucket must pre-exist, see Runbook)
5. `tofu apply -auto-approve` or `tofu destroy -auto-approve`
6. On apply: print `instance_public_ip` to job summary (used to update `SANDBOX_HOST` secret)
7. `rm -f /tmp/oci_key.pem` (always runs)

**Secrets used:** `OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`, `OCI_PRIVATE_KEY`, `OCI_REGION`, `OCI_COMPARTMENT_OCID`, `TF_VAR_SSH_PUBLIC_KEY`

---

## GitHub Secrets Required

| Secret | Used by | Purpose |
|--------|---------|---------|
| `OCI_TENANCY_OCID` | `infra.yml`, `sandbox-access.yml` | OCI auth |
| `OCI_USER_OCID` | `infra.yml`, `sandbox-access.yml` | OCI auth |
| `OCI_FINGERPRINT` | `infra.yml`, `sandbox-access.yml` | OCI auth |
| `OCI_PRIVATE_KEY` | `infra.yml`, `sandbox-access.yml` | OCI auth (PEM key content) |
| `OCI_REGION` | all three | e.g. `us-ashburn-1` |
| `OCI_COMPARTMENT_OCID` | `infra.yml` | Where to create resources |
| `OCI_NSG_OCID` | `sandbox-access.yml` | NSG to add/remove pen-test rules |
| `TF_VAR_SSH_PUBLIC_KEY` | `infra.yml` | Public key injected into VM |
| `SANDBOX_HOST` | `deploy-sandbox.yml` | VM public IP — update after each `tofu apply` |
| `SANDBOX_SSH_KEY` | `deploy-sandbox.yml` | Private key matching `TF_VAR_SSH_PUBLIC_KEY` |

---

## Terraform: Key Resource Decisions

- **VCN CIDR:** `10.0.0.0/16`, public subnet `10.0.1.0/24`
- **Instance shape:** `VM.Standard.A1.Flex`, 2 OCPU / 12 GB RAM
- **OS image:** Latest Ubuntu 22.04 Minimal for aarch64 (resolved via `oci_core_images` data source)
- **cloud-init:** Installs Docker CE (ARM64 apt repo), adds `ubuntu` user to docker group, runs `docker swarm init`
- **Boot volume:** 50 GB
- **Security List:** SSH/22 open to `0.0.0.0/0` (key-only auth); all other inbound denied
- **NSG:** Created empty by Terraform; pen-test rules added/removed dynamically by `sandbox-access.yml`

---

## Operational Runbook

### Prerequisites (one-time)

**Bootstrap Terraform state bucket** (before first `infra.yml` run):
```bash
oci os bucket create \
  --compartment-id <compartment_ocid> \
  --name myapp-tfstate \
  --region <region>
```
Set the bucket name in `infra/backend.tf`. This step cannot be automated in the same Terraform config (chicken-and-egg with remote state).

### First-time provisioning
1. Add all secrets listed above to GitHub repository settings
2. Bootstrap the state bucket (see Prerequisites)
3. Run `infra.yml` → `apply`
4. Copy `instance_public_ip` from job summary → update `SANDBOX_HOST` secret
5. SSH into the VM and create Swarm secrets (use `read -s` to avoid shell history exposure):
   ```bash
   read -s PGPASS
   printf '%s' 'myapp'    | docker secret create postgres_user -
   printf '%s' "$PGPASS"  | docker secret create postgres_password -
   printf '%s' 'myapp'    | docker secret create postgres_db -
   ```
6. Push to `staging` branch to trigger first deploy

### Starting a pen test
1. Run `sandbox-access.yml` → `open`, provide pen tester's IP (CIDR) and ports (default: `80`)

### Ending a pen test
1. Run `sandbox-access.yml` → `close`, same IP and ports

### Full reset between engagements
1. Run `infra.yml` → `destroy`
2. Run `infra.yml` → `apply`
3. Copy new `instance_public_ip` from job summary → **update `SANDBOX_HOST` secret** (the IP changes on every destroy/apply)
4. SSH into new VM and re-create Swarm secrets (step 5 above)
5. Push to `staging` (or re-run `deploy-sandbox.yml`) to redeploy the stack

---

## Constraints and Notes

- **nginx bind-mount:** `docker-stack.yml` bind-mounts `./nginx/nginx.conf`. The deploy workflow copies both `docker-stack.yml` and `nginx/nginx.conf` to `~/myapp/` on the VM, and runs `stack deploy` from `~/myapp/` so the relative path resolves correctly.
- **Dynamic public IP:** OCI assigns a new public IP on each instance creation. `SANDBOX_HOST` must be updated manually after every `terraform apply`. This is called out in the full-reset runbook steps.
- **SSH open to world:** SSH/22 is open to `0.0.0.0/0` because GitHub Actions runner IPs are dynamic and numerous. Key-only authentication is the security control; password auth is disabled by Ubuntu's default cloud image configuration.
- **HTTP only:** nginx is configured for port 80 only. Port 443 is published by `docker-stack.yml` at the Docker/kernel level, so TCP connections to 443 are accepted by the OS but nginx does not respond (no `listen 443` block) — the connection hangs or is closed after the TCP handshake. This is a testable condition for pen testers probing TLS. No TLS termination is configured.
- **OCI Free Tier limits:** One A1 instance up to 4 OCPU / 24 GB RAM total. The spec uses 2 OCPU / 12 GB, leaving room for a second instance if needed.
- **All third-party GitHub Actions pinned to full SHA** per existing repo convention.
