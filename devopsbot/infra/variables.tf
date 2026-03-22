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
