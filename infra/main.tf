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
