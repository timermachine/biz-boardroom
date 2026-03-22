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
