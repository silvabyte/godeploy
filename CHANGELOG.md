# Changelog

## [1.0.4] - 2025-09-09

* chore: update install url
* feat: attach git commit metadata on deploy
* chore: release v1.0.3

## [1.0.4] - 2025-09-09

* feat: include git commit metadata on deploy via CLI
  - New flags: `--commit-sha`, `--commit-branch`, `--commit-message`, `--commit-url`
  - Auto-detects from local git repo by default; disable with `--no-git`

## [1.0.3] - 2025-09-08

* fix: ensure installer points to silvabyte org\n\n- Centralize GitHub org/repo as variables\n- Update all URLs to use silvabyte/godeploy\n
* Update README.md
* chore: release v1.0.2

## [1.0.2] - 2025-09-08

* feat: increase default deploy timeout to 10m\n\n- Use per-deploy HTTP client with 10m default timeout (configurable via GODEPLOY_DEPLOY_TIMEOUT)\n- Accept 200/201/202 as successful deploy statuses\n- Improve CLI error when timeouts occur with guidance\n- Update README and docs with timeout info
* chore: release v1.0.1

## [1.0.1] - 2025-09-01

* feat: improve CLI UX with help and version commands (#13)
* fix: repo in isntall script
* chore: release v1.0.0

## [1.0.0] - 2025-09-01

* docs: update pricing to 9/year unlimited (#12)
* docs: rewrite README with authentic indie hacker voice (#11)
* refactor: transition to SaaS-only model (#10)
* chore: release v0.4.0

## [0.4.0] - 2025-08-31

* feat: Add password-based authentication (#9)
* chore: release v0.3.1

## [0.3.1] - 2025-08-31

* refactor: migrate installer to silvabyte org and fix formatting (#8)
* chore: release v0.3.0

## [0.3.0] - 2025-04-22

* feat: add version cmd (#7)
* chore: release v0.2.2

## [0.2.2] - 2025-04-08

* fix: deploy response (#5)
* chore: add ci badges to readme
* chore: release v0.2.1

## [0.2.1] - 2025-03-29

* chore: remove dated architecture doc
* feat: add make test on ci
* feat: refactor auth callback templates
* chore: update readme
* chore: add architecture document
* refactor: pkg to internal
* chore: add ignore cursor config files
* fix: multi-app config path
* chore: release v0.2.0

## [0.2.0] - 2025-03-19

* chore: update readme
* feat: introduce godeploy.config.json for configuration management and update documentation
* feat: enhance Makefile for multi-app and single-app with build and run commands
* feat: enhance Docker and Nginx integration with improved logging and cleanup
* fix: multiapp serving
* feat: add multi-app static examples
* chore: remove mangled deploy.md table
* chore: release v0.1.4

## [0.1.4] - 2025-03-17

* refactor: revert install script refactor
* refactor: readme
* refactor: install script
* chore: refine deploy docs
* chore: refactor installation script
* chore: release v0.1.3

## [0.1.3] - 2025-03-17

* fix: update installation script URL in README and deployment documentation
* docs: add installation instructions for GoDeploy CLI in deployment guide
* feat: update SPA configuration and enhance deployment messaging
* chore: rename install.sh to now.sh
* feat: enhance authentication process with email handling and token verification
* refactor: update SPA configuration to remove `default_app`
* feat: implement `godeploy deploy` command for instant SPA hosting
* fix: update asset path in release configuration from 'out' to 'dist'
* feat: enhance build process and installation instructions
* docs: remove outdated authentication section from README
* feat: implement token verification for authentication commands
* feat: enhance authentication flow and user experience
* refactor: update authentication commands a
* feat: implement authentication commands and update README with CLI reference
* chore: release v0.1.2

## [0.1.2] - 2025-03-14

* chore: clean up emoji use
* chore: add more perf readme juju
* docs: add upcoming `godeploy deploy` feature to README with alpha sign-up link
* chore: add more kool-aid
* chore: release v0.1.1

## [0.1.1] - 2025-03-14

* chore: update Go version to 1.22 and modify build command in CI workflow
* chore: update build process and output directory configuration
* chore: add basic go ci
* chore: update docs again
* docs: enhance advanced configuration documentation for clarity and structure
* chore: update docs
* docs: overhaul README for improved clarity, structure, and developer experience
* feat: add xrelease
* feat: enhance serve command with customizable port and Docker image name
* fix: update redirect for locales to include scheme and host in Nginx configuration
* feat: add Makefile for build automation and cross-compilation of the godeploy binary
* feat: add init command to CLI for SPA configuration file generation
* feat: implement new CLI tool for SPA deployment with Docker and Nginx
* refactor: remove Dockerfile and update CLI commands for improved usability
* feat: add SPA configuration and enhance Docker and Nginx setup
* chore: more cleanup
* chore: remove build binary
* clean out build artifacts
* feat: initial commit
* Initial commit

