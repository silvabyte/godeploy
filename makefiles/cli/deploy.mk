# CLI deployment and release tasks

CLI_DIR := $(APPS_DIR)/cli
CLI_VERSION := $(shell grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

.PHONY: cli.deploy cli.version cli.version.check cli.release cli.release.dry-run

cli.deploy: cli.build.all ## Build all platforms (alias for release workflow)
	$(call print_header,CLI deployment packages created)
	$(call print_info,Version: $(CLI_VERSION))
	$(call print_info,Distribution files in $(CLI_DIR)/dist/)

cli.version: ## Show CLI version
	$(call print_header,CLI Version)
	@printf "$(CLI_VERSION)\n"

cli.version.check: ## Check CLI version information
	$(call print_header,CLI Version Information)
	@printf "Package version: $(CLI_VERSION)\n"
	@cd $(CLI_DIR) && grep '"version":' package.json

cli.release: cli.build.all ## Create release builds for all platforms
	$(call print_header,Creating CLI release v$(CLI_VERSION))
	$(call print_success,Release packages created in $(CLI_DIR)/dist/)
	$(call print_info,Files:)
	@ls -lh $(CLI_DIR)/dist/

cli.release.dry-run: ## Show what would be released
	$(call print_header,Release dry-run for v$(CLI_VERSION))
	$(call print_info,Would create the following artifacts:)
	@printf "  - godeploy-darwin-amd64.tar.gz\n"
	@printf "  - godeploy-darwin-arm64.tar.gz\n"
	@printf "  - godeploy-linux-amd64.tar.gz\n"
	@printf "  - godeploy-linux-arm64.tar.gz\n"
	@printf "  - godeploy-windows-amd64.zip\n"

