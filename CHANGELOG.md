# Changelog

## [0.1.1] - 2025-08-31

* feat: Migrate from Node.js to Bun runtime and test runner (#6)
* feat: enable dual logging to console and HyperDX in production (#5)
* fix: user tenant id constraint
* feat: add support custom domain for deploy (#4)
* feat: update tenant_users migration and RLS policies (#3)
* feat: rework auto subdomain logic (#2)
* fix: create project if it doesnt exist
* fix: plugin load order and add auth smoke test
* fix: auth verification endpoint
* feat: add db service refactor (#1)
* chore: update database migrations
* feat: introduce run.local.sh script and refactor run.sh
* chore: update Dockerfile for new run script
* chore: add run.sh script to Dockerfile
* feat: integrate OpenTelemetry for enhanced monitoring
* refactor: streamline rate limiting and suspicious path detection
* refactor: improve SPA archive validation and error handling
* refactor: update projectId to projectName in deployment process
* feat: enhance logging and rate limiting features
* feat: improve hash parameter handling in authentication flow
* chore: enhance telemetry in authentication
* feat: enhance token handling in authentication flow
* refactor: update host and schemes configuration in main.ts
* feat: add telemetry logging
* fix: update port configuration in Dockerfile and main.ts
* feat: update Docker configuration and enhance package.json scripts
* feat: add Docker commands to package.json
* feat: enhance project name validation during creation
* feat: implement URL construction utility for CDN links
* chore: update .gitignore to include .mcp/ and .DS_Store
* fix: update S3 client endpoint format for DigitalOcean Spaces
* feat: add rate limiting and deployment script
* feat: enhance authentication and environment configuration
* feat: add environment configuration
* feat: add Docker support and implement deployment API
* feat: implement GoDeploy API with deployment and project management features
* feat: add Supabase configuration and migration scripts
* chore: add dotenv and Supabase dependencies
* chore: update dependencies and add linting configuration
* feat: initial check in
* Initial commit

