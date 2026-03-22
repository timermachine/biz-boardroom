# Oracle Cloud Sandbox Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the myapp monorepo to an Oracle Cloud Free Tier ARM A1 instance running Docker Swarm as a pen-test sandbox, triggered by pushes to the `staging` branch.

**Architecture:** Single-node Docker Swarm on OCI ARM A1 (Ubuntu 22.04), provisioned by OpenTofu. Three GitHub Actions workflows handle infra lifecycle (`infra.yml`), sandbox deployment (`deploy-sandbox.yml`), and firewall management for pen tests (`sandbox-access.yml`). Network access is default-deny; pen-test IPs are added/removed via NSG rules using additive OCI CLI commands.

**Tech Stack:** OpenTofu, OCI Terraform provider (~> 5.0), Docker Swarm, GitHub Actions, OCI CLI, jq

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `docker-stack.yml` | Modify line 5 | Fix image var to use `GITHUB_REPOSITORY` convention |
| `.github/workflows/ci.yml` | Modify | Add Buildx + multi-arch platforms (amd64 + arm64) |
| `infra/variables.tf` | Create | All Terraform input variables |
| `infra/backend.tf` | Create | OCI Object Storage S3-compatible remote state config |
| `infra/main.tf` | Create | OCI provider, VCN, subnet, internet gateway, route table |
| `infra/security.tf` | Create | Security List (SSH/22 open) + empty NSG |
| `infra/compute.tf` | Create | A1 instance + cloud-init (Docker CE, Swarm init) |
| `infra/outputs.tf` | Create | `instance_public_ip`, `nsg_ocid` |
| `infra/terraform.tfvars.example` | Create | Committed template; real values stay in secrets |
| `.github/workflows/infra.yml` | Create | `workflow_dispatch` apply/destroy via OpenTofu |
| `.github/workflows/deploy-sandbox.yml` | Create | Push to staging → build arm64 → deploy Swarm stack |
| `.github/workflows/sandbox-access.yml` | Create | `workflow_dispatch` open/close NSG rules |
| `AGENTS.md` | Modify | Document sandbox environment |

---

## Before You Start — GitHub Actions SHA Verification

This plan pins GitHub Actions to full SHAs per the repo convention. The SHAs below must be verified before writing any workflow file. Run these commands and substitute the real SHA into each step where indicated:

```bash
# opentofu/setup-opentofu — check tags at https://github.com/opentofu/setup-opentofu/tags
# Use the latest v1.x.x or v2.x.x tag SHA. Example lookup:
gh api repos/opentofu/setup-opentofu/git/ref/tags/v1.0.8 --jq '.object.sha'

# appleboy/scp-action — check tags at https://github.com/appleboy/scp-action/tags
gh api repos/appleboy/scp-action/git/ref/tags/v1.0.0 --jq '.object.sha'
```

Actions already used in this repo (no verification needed — taken directly from existing workflows):
- `actions/checkout@v4` — used as-is to match existing repo pattern (known deviation from spec SHA-pin requirement; accepted)
- `docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9`
- `docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f`
- `docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25`
- `appleboy/ssh-action@0ff4204d59e8e51228ff73bce53f80d53301dee2`

---

## Task 1: Fix docker-stack.yml image variable

**Files:**
- Modify: `docker-stack.yml:5`

The current `${IMAGE:-your-org/myapp}:${TAG:-latest}` pattern is inconsistent with `docker-stack.prod.yml`. Update to use `GITHUB_REPOSITORY` so the sandbox deploy workflow can pass the full registry path without a separate `IMAGE` variable.

- [ ] **Step 1: Edit docker-stack.yml line 5**

Change:
```yaml
    image: ${IMAGE:-your-org/myapp}:${TAG:-latest}
```
To:
```yaml
    image: ghcr.io/${GITHUB_REPOSITORY:-your-org/myapp}:${TAG:-latest}
```

- [ ] **Step 2: Verify no other references to `${IMAGE}` remain**

```bash
grep -n 'IMAGE' docker-stack.yml
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add docker-stack.yml
git commit -m "fix: align docker-stack.yml image var with prod convention"
```

---

## Task 2: Update ci.yml for multi-arch builds

**Files:**
- Modify: `.github/workflows/ci.yml`

Add Buildx setup and `linux/amd64,linux/arm64` platforms so PRs build both architectures. The sandbox uses the same GHCR image as CI, pulled to an arm64 host.

- [ ] **Step 1: Add Buildx setup step after "Log in to GHCR" (after line 53)**

```yaml
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f
```

- [ ] **Step 2: Update the "Build and push image" step to add platforms and cache**

Replace the existing `docker/build-push-action` step with:
```yaml
      - name: Build and push image to GHCR
        uses: docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25
        with:
          context: ./app
          target: production
          push: true
          platforms: linux/amd64,linux/arm64
          cache-from: type=gha
          cache-to: type=gha,mode=max
          tags: |
            ${{ env.IMAGE }}:${{ github.sha }}
            ${{ env.IMAGE }}:pr-${{ github.event.number || github.run_id }}
```

- [ ] **Step 3: Verify valid YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo OK
```
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Buildx and linux/arm64 platform to CI image build"
```

---

## Task 3: Terraform — variables, backend, provider + networking

**Files:**
- Create: `infra/variables.tf`
- Create: `infra/backend.tf`
- Create: `infra/main.tf`
- Create: `infra/terraform.tfvars.example`

- [ ] **Step 1: Create `infra/variables.tf`**

```hcl
variable "tenancy_ocid" {
  description = "OCID of the OCI tenancy"
  type        = string
}

variable "user_ocid" {
  description = "OCID of the OCI user"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the OCI API key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the OCI API private key PEM file"
  type        = string
  default     = "/tmp/oci_key.pem"
}

variable "region" {
  description = "OCI region, e.g. us-ashburn-1"
  type        = string
}

variable "compartment_ocid" {
  description = "OCID of the compartment to create resources in"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key to inject into the VM for the ubuntu user"
  type        = string
}

variable "instance_ocpus" {
  description = "Number of OCPUs for the A1 instance"
  type        = number
  default     = 2
}

variable "instance_memory_in_gbs" {
  description = "Memory in GB for the A1 instance"
  type        = number
  default     = 12
}

variable "boot_volume_size_in_gbs" {
  description = "Boot volume size in GB"
  type        = number
  default     = 50
}
```

- [ ] **Step 2: Create `infra/backend.tf`**

The S3 backend uses OCI Object Storage's S3-compatible API. Two credentials separate from the API key pair are required: an **OCI Customer Secret Key** (access key ID + secret). Create one at: OCI Console → Identity → Users → your user → Customer Secret Keys. Store the key ID as `OCI_STORAGE_ACCESS_KEY` and the secret value as `OCI_STORAGE_SECRET_KEY` in GitHub Secrets.

The `region` and `endpoint` fields are intentionally omitted from this file and passed dynamically via `-backend-config` in `infra.yml` so no region is hard-coded.

```hcl
terraform {
  backend "s3" {
    bucket = "myapp-tfstate"
    key    = "sandbox/terraform.tfstate"

    # region and endpoint are passed at init time via -backend-config flags in infra.yml
    # access_key / secret_key are passed via AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars

    skip_region_validation      = true
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    force_path_style            = true
  }
}
```

- [ ] **Step 3: Create `infra/main.tf`**

```hcl
terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.6"
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# VCN
resource "oci_core_vcn" "sandbox" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.0.0.0/16"
  display_name   = "myapp-sandbox-vcn"
  dns_label      = "sandboxvcn"
}

# Internet Gateway
resource "oci_core_internet_gateway" "sandbox" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.sandbox.id
  display_name   = "myapp-sandbox-igw"
  enabled        = true
}

# Route Table
resource "oci_core_route_table" "sandbox" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.sandbox.id
  display_name   = "myapp-sandbox-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.sandbox.id
  }
}

# Public Subnet
resource "oci_core_subnet" "sandbox" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.sandbox.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "myapp-sandbox-subnet"
  dns_label         = "sandboxsubnet"
  route_table_id    = oci_core_route_table.sandbox.id
  security_list_ids = [oci_core_security_list.sandbox.id]

  prohibit_public_ip_on_vnic = false
}
```

- [ ] **Step 4: Create `infra/terraform.tfvars.example`**

```hcl
tenancy_ocid     = "ocid1.tenancy.oc1..example"
user_ocid        = "ocid1.user.oc1..example"
fingerprint      = "aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99"
region           = "us-ashburn-1"
compartment_ocid = "ocid1.compartment.oc1..example"
ssh_public_key   = "ssh-ed25519 AAAA... your-key-comment"

# Optional overrides (defaults shown)
# instance_ocpus          = 2
# instance_memory_in_gbs  = 12
# boot_volume_size_in_gbs = 50
```

- [ ] **Step 5: Commit (do not run tofu validate yet — security.tf and compute.tf are needed first)**

```bash
git add infra/variables.tf infra/backend.tf infra/main.tf infra/terraform.tfvars.example
git commit -m "feat(infra): OCI provider, VCN, subnet, and route table"
```

---

## Task 4: Terraform — security, compute, and outputs

**Files:**
- Create: `infra/security.tf`
- Create: `infra/compute.tf`
- Create: `infra/outputs.tf`

- [ ] **Step 1: Create `infra/security.tf`**

```hcl
# Security List — subnet-level, SSH always open
resource "oci_core_security_list" "sandbox" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.sandbox.id
  display_name   = "myapp-sandbox-sl"

  # Allow all outbound
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }

  # SSH open to world — key-only auth is the security control
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 22
      max = 22
    }
  }
}

# NSG — attached to instance, starts empty.
# Pen-test rules are added/removed dynamically by sandbox-access.yml.
resource "oci_core_network_security_group" "sandbox" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.sandbox.id
  display_name   = "myapp-sandbox-nsg"
}
```

- [ ] **Step 2: Verify the Ubuntu image version string for your region**

OCI image version strings are exact and region-specific. Before writing `compute.tf`, confirm the string:

```bash
oci compute image list \
  --compartment-id <OCI_COMPARTMENT_OCID> \
  --operating-system "Canonical Ubuntu" \
  --shape "VM.Standard.A1.Flex" \
  --query 'data[*]."operating-system-version"' \
  --output table | head -10
```

Expected output will show strings like `"22.04 Minimal"` or `"22.04 Minimal aarch64"`. Use the exact string shown. The `compute.tf` below uses `"22.04 Minimal"` — update it if your region uses a different string.

- [ ] **Step 3: Create `infra/compute.tf`**

```hcl
# Resolve latest Ubuntu 22.04 Minimal ARM64 image for the region.
# The shape filter (VM.Standard.A1.Flex) already constrains to ARM64.
# Verify the operating_system_version string with: oci compute image list --shape VM.Standard.A1.Flex
data "oci_core_images" "ubuntu_arm64" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04 Minimal"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

locals {
  ubuntu_image_id = data.oci_core_images.ubuntu_arm64.images[0].id

  cloud_init = <<-EOT
    #cloud-config
    package_update: true
    package_upgrade: false

    packages:
      - apt-transport-https
      - ca-certificates
      - curl
      - gnupg
      - lsb-release

    runcmd:
      - install -m 0755 -d /etc/apt/keyrings
      - curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
      - chmod a+r /etc/apt/keyrings/docker.asc
      - |
        echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
          > /etc/apt/sources.list.d/docker.list
      - apt-get update
      - apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
      - usermod -aG docker ubuntu
      - systemctl enable docker
      - systemctl start docker
      - su -c "docker swarm init" ubuntu
  EOT
}

resource "oci_core_instance" "sandbox" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "myapp-sandbox"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_in_gbs
  }

  source_details {
    source_type             = "image"
    source_id               = local.ubuntu_image_id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.sandbox.id
    assign_public_ip = true
    nsg_ids          = [oci_core_network_security_group.sandbox.id]
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(local.cloud_init)
  }
}
```

- [ ] **Step 4: Create `infra/outputs.tf`**

```hcl
output "instance_public_ip" {
  description = "Public IP of the sandbox VM — update SANDBOX_HOST secret after apply"
  value       = oci_core_instance.sandbox.public_ip
}

output "nsg_ocid" {
  description = "NSG OCID — set as OCI_NSG_OCID secret for sandbox-access.yml"
  value       = oci_core_network_security_group.sandbox.id
}
```

- [ ] **Step 5: Validate the full Terraform config**

```bash
cd infra && tofu validate
```
Expected: `Success! The configuration is valid.`

(Requires `tofu` installed locally. If not available, skip — `infra.yml` will run validation in CI.)

- [ ] **Step 6: Commit**

```bash
git add infra/security.tf infra/compute.tf infra/outputs.tf
git commit -m "feat(infra): security list, NSG, A1 compute instance with cloud-init"
```

---

## Task 5: infra.yml workflow

**Files:**
- Create: `.github/workflows/infra.yml`

**Before writing this file:** Look up and verify the SHA for `opentofu/setup-opentofu`:

```bash
gh api repos/opentofu/setup-opentofu/git/ref/tags/v1.0.8 --jq '.object.sha'
```

Substitute the verified SHA into the `uses:` line below where `<OPENTOFU_SHA>` appears.

- [ ] **Step 1: Create `.github/workflows/infra.yml`**

```yaml
name: Infra

on:
  workflow_dispatch:
    inputs:
      action:
        description: "Terraform action"
        required: true
        type: choice
        options:
          - apply
          - destroy

jobs:
  tofu:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    env:
      TF_VAR_tenancy_ocid:      ${{ secrets.OCI_TENANCY_OCID }}
      TF_VAR_user_ocid:         ${{ secrets.OCI_USER_OCID }}
      TF_VAR_fingerprint:       ${{ secrets.OCI_FINGERPRINT }}
      TF_VAR_region:            ${{ secrets.OCI_REGION }}
      TF_VAR_compartment_ocid:  ${{ secrets.OCI_COMPARTMENT_OCID }}
      TF_VAR_ssh_public_key:    ${{ secrets.TF_VAR_SSH_PUBLIC_KEY }}
      TF_VAR_private_key_path:  /tmp/oci_key.pem
      # S3 backend credentials — OCI Customer Secret Keys (not the API key pair)
      # Create at: OCI Console → Identity → Users → your user → Customer Secret Keys
      AWS_ACCESS_KEY_ID:        ${{ secrets.OCI_STORAGE_ACCESS_KEY }}
      AWS_SECRET_ACCESS_KEY:    ${{ secrets.OCI_STORAGE_SECRET_KEY }}

    steps:
      - uses: actions/checkout@v4

      - name: Write OCI private key
        run: |
          printf '%s' "${{ secrets.OCI_PRIVATE_KEY }}" > /tmp/oci_key.pem
          chmod 600 /tmp/oci_key.pem

      - name: Set up OpenTofu
        uses: opentofu/setup-opentofu@<OPENTOFU_SHA>   # verify SHA before committing
        with:
          tofu_version: "1.8.x"

      - name: tofu init
        working-directory: infra
        run: |
          tofu init \
            -backend-config="region=${{ secrets.OCI_REGION }}" \
            -backend-config="endpoint=https://${{ secrets.OCI_STORAGE_NAMESPACE }}.compat.objectstorage.${{ secrets.OCI_REGION }}.oraclecloud.com"

      - name: tofu apply
        if: ${{ inputs.action == 'apply' }}
        working-directory: infra
        run: tofu apply -auto-approve

      - name: tofu destroy
        if: ${{ inputs.action == 'destroy' }}
        working-directory: infra
        run: tofu destroy -auto-approve

      - name: Print outputs (apply only)
        if: ${{ inputs.action == 'apply' }}
        working-directory: infra
        run: |
          IP=$(tofu output -raw instance_public_ip)
          NSG=$(tofu output -raw nsg_ocid)
          {
            echo "## Sandbox provisioned"
            echo ""
            echo "| Secret | Value |"
            echo "|--------|-------|"
            echo "| \`SANDBOX_HOST\` | \`$IP\` |"
            echo "| \`OCI_NSG_OCID\` | \`$NSG\` |"
            echo ""
            echo "Update both repository secrets with these values before running deploy-sandbox.yml."
          } >> "$GITHUB_STEP_SUMMARY"

      - name: Remove OCI private key
        if: always()
        run: rm -f /tmp/oci_key.pem
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/infra.yml'))" && echo OK
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/infra.yml
git commit -m "feat: add infra.yml workflow for OpenTofu apply/destroy"
```

---

## Task 6: deploy-sandbox.yml workflow

**Files:**
- Create: `.github/workflows/deploy-sandbox.yml`

**Before writing this file:** Look up and verify the SHA for `appleboy/scp-action`:

```bash
gh api repos/appleboy/scp-action/git/ref/tags/v1.0.0 --jq '.object.sha'
```

Substitute the verified SHA where `<SCP_ACTION_SHA>` appears below.

- [ ] **Step 1: Create `.github/workflows/deploy-sandbox.yml`**

```yaml
name: Deploy Sandbox

on:
  push:
    branches: [staging]
    paths:
      - "app/**"
      - "docker-stack.yml"
      - "nginx/**"
      - ".github/workflows/deploy-sandbox.yml"

env:
  REGISTRY: ghcr.io
  IMAGE: ghcr.io/${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f

      - name: Build and push (arm64 only)
        uses: docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25
        with:
          context: ./app
          target: production
          push: true
          platforms: linux/arm64
          cache-from: type=gha
          cache-to: type=gha,mode=max
          tags: |
            ${{ env.IMAGE }}:staging-latest
            ${{ env.IMAGE }}:staging-${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Copy nginx config to VM
        uses: appleboy/scp-action@<SCP_ACTION_SHA>   # verify SHA before committing
        with:
          host: ${{ secrets.SANDBOX_HOST }}
          username: ubuntu
          key: ${{ secrets.SANDBOX_SSH_KEY }}
          source: "nginx/nginx.conf"
          target: "~/myapp/"
          strip_components: 0

      - name: Copy stack file to VM
        uses: appleboy/scp-action@<SCP_ACTION_SHA>
        with:
          host: ${{ secrets.SANDBOX_HOST }}
          username: ubuntu
          key: ${{ secrets.SANDBOX_SSH_KEY }}
          source: "docker-stack.yml"
          target: "~/myapp/"
          strip_components: 0

      - name: Deploy Swarm stack
        uses: appleboy/ssh-action@0ff4204d59e8e51228ff73bce53f80d53301dee2
        with:
          host: ${{ secrets.SANDBOX_HOST }}
          username: ubuntu
          key: ${{ secrets.SANDBOX_SSH_KEY }}
          script: |
            cd ~/myapp
            echo "${{ secrets.GITHUB_TOKEN }}" | \
              docker login ghcr.io -u ${{ github.actor }} --password-stdin
            GITHUB_REPOSITORY=${{ github.repository }} TAG=staging-${{ github.sha }} \
              docker stack deploy -c docker-stack.yml myapp --with-registry-auth
            docker image prune -f
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-sandbox.yml'))" && echo OK
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-sandbox.yml
git commit -m "feat: add deploy-sandbox.yml workflow for staging branch"
```

---

## Task 7: sandbox-access.yml workflow

**Files:**
- Create: `.github/workflows/sandbox-access.yml`

Opens or closes OCI NSG rules for a pen tester's IP. Uses `oci network nsg rules add` (additive, safe to call multiple times) and `oci network nsg rules remove` (targeted by rule ID, fetched with jq).

OCI CLI version is pinned via pip to avoid silent drift:

```bash
# Check the latest stable version before implementing:
pip index versions oci-cli 2>/dev/null | head -1
# Or check: https://pypi.org/pypi/oci-cli/json | jq -r .info.version
```

- [ ] **Step 1: Create `.github/workflows/sandbox-access.yml`**

```yaml
name: Sandbox Access

on:
  workflow_dispatch:
    inputs:
      action:
        description: "open or close"
        required: true
        type: choice
        options:
          - open
          - close
      ip:
        description: "IP CIDR to allow (e.g. 203.0.113.5/32)"
        required: true
        type: string
      ports:
        description: "Comma-separated ports (default: 80)"
        required: false
        default: "80"
        type: string

jobs:
  manage-access:
    runs-on: ubuntu-latest

    steps:
      - name: Install OCI CLI
        run: |
          # Pin the version — update this when OCI CLI releases a new stable version
          pip install oci-cli==3.53.0

      - name: Configure OCI CLI
        run: |
          mkdir -p ~/.oci
          printf '%s' "${{ secrets.OCI_PRIVATE_KEY }}" > ~/.oci/oci_api_key.pem
          chmod 600 ~/.oci/oci_api_key.pem
          cat > ~/.oci/config <<'OCICONF'
[DEFAULT]
user=OCI_USER_PLACEHOLDER
fingerprint=OCI_FINGERPRINT_PLACEHOLDER
tenancy=OCI_TENANCY_PLACEHOLDER
region=OCI_REGION_PLACEHOLDER
key_file=~/.oci/oci_api_key.pem
OCICONF
          # Replace placeholders with secret values (avoids heredoc indentation issues)
          sed -i "s|OCI_USER_PLACEHOLDER|${{ secrets.OCI_USER_OCID }}|" ~/.oci/config
          sed -i "s|OCI_FINGERPRINT_PLACEHOLDER|${{ secrets.OCI_FINGERPRINT }}|" ~/.oci/config
          sed -i "s|OCI_TENANCY_PLACEHOLDER|${{ secrets.OCI_TENANCY_OCID }}|" ~/.oci/config
          sed -i "s|OCI_REGION_PLACEHOLDER|${{ secrets.OCI_REGION }}|" ~/.oci/config

      - name: Open NSG rules
        if: ${{ inputs.action == 'open' }}
        env:
          NSG_ID: ${{ secrets.OCI_NSG_OCID }}
          IP: ${{ inputs.ip }}
          PORTS: ${{ inputs.ports }}
        run: |
          for PORT in $(echo "$PORTS" | tr ',' ' '); do
            PORT=$(echo "$PORT" | tr -d ' ')
            echo "Opening port $PORT for $IP"
            oci network nsg rules add \
              --nsg-id "$NSG_ID" \
              --security-rules "[{
                \"direction\": \"INGRESS\",
                \"protocol\": \"6\",
                \"source\": \"$IP\",
                \"source-type\": \"CIDR_BLOCK\",
                \"is-stateless\": false,
                \"description\": \"pentest-${PORT}\",
                \"tcp-options\": {
                  \"destination-port-range\": {
                    \"min\": $PORT,
                    \"max\": $PORT
                  }
                }
              }]"
          done

      - name: Close NSG rules
        if: ${{ inputs.action == 'close' }}
        env:
          NSG_ID: ${{ secrets.OCI_NSG_OCID }}
          IP: ${{ inputs.ip }}
          PORTS: ${{ inputs.ports }}
        run: |
          for PORT in $(echo "$PORTS" | tr ',' ' '); do
            PORT=$(echo "$PORT" | tr -d ' ')
            echo "Closing port $PORT for $IP"

            RULES_JSON=$(oci network nsg rules list --nsg-id "$NSG_ID" --all)
            RULE_IDS=$(echo "$RULES_JSON" | jq -r \
              --arg ip "$IP" \
              --argjson port "$PORT" \
              '[.data[] | select(
                  .source == $ip and
                  (."tcp-options"."destination-port-range".min == $port or
                   ."tcp-options"."destination-port-range".max == $port)
                ) | .id]')

            COUNT=$(echo "$RULE_IDS" | jq 'length')
            if [ "$COUNT" -gt 0 ]; then
              echo "Removing $COUNT rule(s) for port $PORT from $IP"
              oci network nsg rules remove \
                --nsg-id "$NSG_ID" \
                --security-rule-ids "$RULE_IDS" \
                --force
            else
              echo "No matching rules found for port $PORT / $IP — nothing to remove"
            fi
          done

      - name: Clean up OCI credentials
        if: always()
        run: rm -f ~/.oci/oci_api_key.pem
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/sandbox-access.yml'))" && echo OK
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/sandbox-access.yml
git commit -m "feat: add sandbox-access.yml for pen-test NSG management"
```

---

## Task 8: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Append sandbox section to AGENTS.md**

Add after the existing "CI/CD Workflows" section:

```markdown
## Sandbox Environment (Oracle Cloud)

Pre-production pen-test sandbox on OCI ARM A1, triggered by the `staging` branch.

### Infrastructure
- **Provisioned by:** `infra/` (OpenTofu) — run via `infra.yml` workflow
- **Compute:** OCI ARM A1 Flex, 2 OCPU / 12 GB RAM, Ubuntu 22.04
- **Orchestration:** Docker Swarm single-node
- **Stack file:** `docker-stack.yml` (single-node, no placement constraints)

### Sandbox Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `infra.yml` | `workflow_dispatch` (apply/destroy) | Provision or tear down OCI infrastructure |
| `deploy-sandbox.yml` | Push to `staging` | Build arm64 image + deploy Swarm stack |
| `sandbox-access.yml` | `workflow_dispatch` (open/close, ip, ports) | Add/remove NSG rules for pen testers |

### GitHub Secrets (sandbox-specific)

| Secret | Purpose |
|--------|---------|
| `OCI_TENANCY_OCID` | OCI auth |
| `OCI_USER_OCID` | OCI auth |
| `OCI_FINGERPRINT` | OCI auth |
| `OCI_PRIVATE_KEY` | OCI auth (PEM content) |
| `OCI_REGION` | e.g. `us-ashburn-1` |
| `OCI_COMPARTMENT_OCID` | Where resources are created |
| `OCI_NSG_OCID` | NSG for pen-test firewall rules (output from `infra.yml`) |
| `OCI_STORAGE_ACCESS_KEY` | OCI Customer Secret Key ID (Terraform S3 backend) |
| `OCI_STORAGE_SECRET_KEY` | OCI Customer Secret Key value (Terraform S3 backend) |
| `OCI_STORAGE_NAMESPACE` | Tenancy object storage namespace (`oci os ns get`) |
| `TF_VAR_SSH_PUBLIC_KEY` | Public key injected into VM |
| `SANDBOX_HOST` | VM public IP — update after each `tofu apply` |
| `SANDBOX_SSH_KEY` | Private key matching `TF_VAR_SSH_PUBLIC_KEY` |

### Networking
- SSH/22: open to world, key-only auth (GitHub Actions runner IPs are dynamic)
- HTTP/80: default-deny; opened per pen test via `sandbox-access.yml`
- HTTP only — no TLS configured
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: document OCI sandbox environment in AGENTS.md"
```

---

## Task 9: Create staging branch

**Important:** Ensure you are on the branch containing all commits from Tasks 1–8 before creating `staging`. If you have been working on `main`, all commits will be present on `main` — `git checkout -b staging` creates `staging` from current HEAD, so all prior changes carry over automatically.

- [ ] **Step 1: Verify all Task 1–8 commits are present**

```bash
git log --oneline -10
```
Expected: see commits from Tasks 1–8 in the log.

- [ ] **Step 2: Create and push staging branch**

```bash
git checkout -b staging
git push -u origin staging
```

- [ ] **Step 3: Verify the branch exists on the remote**

```bash
git branch -r | grep staging
```
Expected: `  origin/staging`

Note: The `deploy-sandbox.yml` path filter requires changes to `app/**`, `docker-stack.yml`, `nginx/**`, or `.github/workflows/deploy-sandbox.yml` to trigger a deploy. A push that only touches Terraform files or docs will not trigger the sandbox deploy — this is intentional.

---

## Summary: Secrets and Bootstrap Checklist

Complete in this order before running any workflow:

### 1. Create OCI API key pair
OCI Console → Identity → Users → your user → API Keys → Add API Key. Download the private key PEM.

### 2. Create OCI Customer Secret Key (for Terraform state backend)
OCI Console → Identity → Users → your user → Customer Secret Keys → Generate Secret Key. Save both the key ID and the secret value (shown once).

### 3. Bootstrap Terraform state bucket (one-time, before first `infra.yml`)
```bash
oci os bucket create \
  --compartment-id <OCI_COMPARTMENT_OCID> \
  --name myapp-tfstate \
  --region <OCI_REGION>
```

### 4. Add all secrets to GitHub (`Settings → Secrets and variables → Actions`)

| Secret | How to get it |
|--------|--------------|
| `OCI_TENANCY_OCID` | OCI Console → Tenancy details |
| `OCI_USER_OCID` | OCI Console → Identity → Users → your user |
| `OCI_FINGERPRINT` | OCI Console → your user → API Keys |
| `OCI_PRIVATE_KEY` | Contents of the downloaded PEM file |
| `OCI_REGION` | e.g. `us-ashburn-1` |
| `OCI_COMPARTMENT_OCID` | OCI Console → Identity → Compartments |
| `OCI_STORAGE_ACCESS_KEY` | OCI Console → your user → Customer Secret Keys → Key ID |
| `OCI_STORAGE_SECRET_KEY` | Value shown at Customer Secret Key creation |
| `OCI_STORAGE_NAMESPACE` | `oci os ns get --output json \| jq -r .data` |
| `TF_VAR_SSH_PUBLIC_KEY` | `cat ~/.ssh/id_ed25519.pub` (or generate a dedicated keypair) |
| `SANDBOX_SSH_KEY` | Private key matching `TF_VAR_SSH_PUBLIC_KEY` |

### 5. Run `infra.yml` → apply
After it completes, set:
- `SANDBOX_HOST` = IP from job summary
- `OCI_NSG_OCID` = NSG OCID from job summary

### 6. Create Swarm secrets on the VM
```bash
ssh ubuntu@<SANDBOX_HOST>
read -s PGPASS
printf '%s' 'myapp'   | docker secret create postgres_user -
printf '%s' "$PGPASS" | docker secret create postgres_password -
printf '%s' 'myapp'   | docker secret create postgres_db -
```

### 7. Push to staging to deploy the stack
```bash
git push origin staging
```
