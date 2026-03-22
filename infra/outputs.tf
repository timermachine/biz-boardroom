output "instance_public_ip" {
  description = "Public IP of the sandbox VM — update SANDBOX_HOST secret after apply"
  value       = oci_core_instance.sandbox.public_ip
}

output "nsg_ocid" {
  description = "NSG OCID — set as OCI_NSG_OCID secret for sandbox-access.yml"
  value       = oci_core_network_security_group.sandbox.id
}
