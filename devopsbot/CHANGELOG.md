# Changelog

All notable changes to DevOpsBot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-22

### Added
- Initial versioned infrastructure base extracted from `timermachine/cicd1`
- Node/Express + PostgreSQL + nginx Docker Compose stack (dev, prod, sandbox variants)
- GitHub Actions workflows: CI, deploy, infra provisioning, sandbox access, Codacy, Snyk
- OpenTofu/Terraform definitions for OCI ARM A1 sandbox environment
- Playwright e2e test harness
- Reference consumer example in `app/`
- `git subtree` consumer pattern documented in README

### Breaking Changes

None — initial release.

[0.1.0]: https://github.com/timermachine/DevOpsBot/releases/tag/v0.1.0
