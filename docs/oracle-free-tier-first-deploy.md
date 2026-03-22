# First-Time Oracle Cloud Free Tier Deployment (CI Green Path)

This guide gets this repo's **staging sandbox deployment** green using OCI Free Tier and existing GitHub Actions workflows.

- Target workflows: `infra.yml` -> `deploy-sandbox.yml` -> `sandbox-access.yml`
- Deployment target: single ARM VM (`VM.Standard.A1.Flex`) running Docker Swarm
- Goal: deploy from CI with minimal risk of paid usage

## 1) Before You Start

1. Confirm you are using an Oracle Cloud **Free Tier** account and deploying in your home region.
2. Confirm this repo has the sandbox workflow files already present:
   - `.github/workflows/infra.yml`
   - `.github/workflows/deploy-sandbox.yml`
   - `.github/workflows/sandbox-access.yml`
3. Generate an SSH keypair for sandbox access (public key for Terraform, private key for GitHub secret).

## 2) Cost Guardrails (Do This First)

As of **March 19, 2026**, OCI docs state Always Free includes:
- Up to **4 OCPUs + 24 GB RAM total** for Ampere A1 compute
- **10 TB/month outbound data transfer**

References:
- Free Tier overview: https://docs.oracle.com/iaas/Content/FreeTier/freetier.htm
- Always Free resources: https://docs.oracle.com/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm

### 2.1 Create budget + alert rules

Use OCI Billing budgets and alerts:
- Managing Budgets: https://docs.oracle.com/en-us/iaas/Content/Billing/Tasks/managingbudgets.htm
- Managing Budget Alert Rules: https://docs.oracle.com/en-us/iaas/Content/Billing/Tasks/managingalertrules.htm

Recommended setup:
1. Create a monthly budget scoped to your sandbox compartment.
2. Add alert rules for **actual + forecast** at `50%`, `80%`, `100%`.
3. Send alerts to email and your team channel.

Important: Budget alerts notify you, but do not hard-stop resource creation.

### 2.2 Cap processing with quotas

Use compartment quotas to enforce hard caps:
- Quota overview: https://docs.public.content.oci.oraclecloud.com/iaas/Content/Quotas/Concepts/resourcequotas.htm
- Quota syntax: https://docs.oracle.com/iaas/Content/Quotas/Concepts/quota_policy_syntax.htm
- Creating quotas: https://docs.oracle.com/en-us/iaas/Content/Quotas/Tasks/create-quota.htm
- Compute quota names: https://docs.oracle.com/en-us/iaas/Content/Quotas/Concepts/resourcequotas_topic-Compute_Quotas.htm

Example policy statements for sandbox compartment `myapp-sandbox`:

```text
set compute-core quota standard-a1-core-count to 2 in compartment myapp-sandbox
set compute-memory quota standard-a1-memory-count to 12 in compartment myapp-sandbox
zero compute-core quota standard-e4-core-count in compartment myapp-sandbox
zero compute-core quota standard-e5-core-count in compartment myapp-sandbox
zero compute-core quota standard3-core-count in compartment myapp-sandbox
```

Notes:
- Keep A1 caps at or below your intended footprint.
- New quota policies can take several minutes to apply.

### 2.3 Monitor bandwidth and cost continuously

Use:
- Cost Analysis: https://docs.oracle.com/iaas/Content/Billing/Concepts/costanalysisoverview.htm
- Cost Reports: https://docs.oracle.com/iaas/Content/Billing/Concepts/costusagereportsoverview.htm

Operational control in this repo:
- Keep sandbox HTTP closed by default and open only during tests using `sandbox-access.yml`.

## 3) Configure GitHub Secrets

Set these repository secrets before running workflows.

### OCI auth + infra
- `OCI_TENANCY_OCID`
- `OCI_USER_OCID`
- `OCI_FINGERPRINT`
- `OCI_PRIVATE_KEY` (PEM content)
- `OCI_REGION`
- `OCI_COMPARTMENT_OCID`
- `OCI_STORAGE_ACCESS_KEY`
- `OCI_STORAGE_SECRET_KEY`
- `OCI_STORAGE_NAMESPACE`
- `TF_VAR_SSH_PUBLIC_KEY`

### Sandbox deploy/runtime
- `SANDBOX_SSH_KEY` (private key matching `TF_VAR_SSH_PUBLIC_KEY`)
- `SANDBOX_HOST` (filled after infra apply)
- `OCI_NSG_OCID` (filled after infra apply)

## 4) Provision Infrastructure from CI

1. Run workflow `infra.yml` manually (`workflow_dispatch`) with input:
   - `action=apply`
2. Wait for success.
3. In workflow summary, copy output values and update secrets:
   - `SANDBOX_HOST`
   - `OCI_NSG_OCID`

## 5) One-Time VM Bootstrap for Swarm Secrets

`docker-stack.yml` expects external Swarm secrets:
- `postgres_user`
- `postgres_password`
- `postgres_db`

SSH to VM:

```bash
ssh ubuntu@<SANDBOX_HOST>
```

Run:

```bash
mkdir -p ~/myapp

# Swarm should already be initialized by cloud-init, but ensure it.
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)" != "active" ]; then
  docker swarm init
fi

# Set your DB credentials
export POSTGRES_USER=myapp
export POSTGRES_PASSWORD='replace-with-strong-password'
export POSTGRES_DB=myapp

# Idempotent create-if-missing
for secret in postgres_user postgres_password postgres_db; do
  if ! docker secret ls --format '{{.Name}}' | grep -qx "$secret"; then
    case "$secret" in
      postgres_user) printf '%s' "$POSTGRES_USER" | docker secret create postgres_user - ;;
      postgres_password) printf '%s' "$POSTGRES_PASSWORD" | docker secret create postgres_password - ;;
      postgres_db) printf '%s' "$POSTGRES_DB" | docker secret create postgres_db - ;;
    esac
  fi
done
```

## 6) Trigger First Deployment from CI

`deploy-sandbox.yml` triggers on push to `staging` with changes in:
- `app/**`
- `docker-stack.yml`
- `nginx/**`
- `.github/workflows/deploy-sandbox.yml`

Trigger method:

```bash
git checkout staging
git commit --allow-empty -m "chore: trigger first sandbox deploy"
git push origin staging
```

Then confirm in Actions:
1. `Deploy Sandbox / build-and-push` green
2. `Deploy Sandbox / deploy` green

## 7) Open HTTP for Validation (Temporary)

Use `sandbox-access.yml` (`workflow_dispatch`):
- `action=open`
- `ip=<your_public_ip>/32`
- `ports=80`

Validate:

```bash
curl http://<SANDBOX_HOST>/health
curl http://<SANDBOX_HOST>/db-health
```

Close access when done:
- Run `sandbox-access.yml` with `action=close`, same IP/ports.

## 8) Green Deployment Checklist

- `infra.yml` succeeded
- `SANDBOX_HOST` and `OCI_NSG_OCID` secrets updated
- Swarm secrets exist on VM (`postgres_user`, `postgres_password`, `postgres_db`)
- `deploy-sandbox.yml` succeeded (both jobs)
- `/health` returns `200`
- `/db-health` returns `200`
- Temporary NSG opening closed after test
- Budgets/alerts and quotas configured

## 9) Zero-Charge Discipline

To keep spend at zero (or closest possible):
1. Stay within Always Free allocations (A1 CPU/RAM + outbound transfer).
2. Keep quota caps strict and review them monthly.
3. Keep sandbox access closed except test windows.
4. Destroy sandbox infra when not actively testing (`infra.yml` with `action=destroy`).
5. Review Cost Analysis weekly.
