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
