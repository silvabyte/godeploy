# CLI release tasks

CLI_DIR := $(APPS_DIR)/cli
CLI_VERSION := $(shell grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

.PHONY: cli.version cli.version.bump.major cli.version.bump.minor cli.version.bump.patch cli.release cli.release.prepare cli.release.publish

cli.version: ## Show CLI version
	@printf "v$(CLI_VERSION)\n"

cli.version.bump.patch: ## Bump patch version (x.x.X)
	$(call print_header,Bumping CLI patch version)
	@cd $(CLI_DIR) && npm version patch --no-git-tag-version 2>&1 | grep -v "npm error" || true
	@$(MAKE) cli.version.sync
	@NEW_VERSION=$$(grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	printf "$(COLOR_GREEN)✓ Version bumped to v$$NEW_VERSION$(COLOR_RESET)\n"

cli.version.bump.minor: ## Bump minor version (x.X.0)
	$(call print_header,Bumping CLI minor version)
	@cd $(CLI_DIR) && npm version minor --no-git-tag-version 2>&1 | grep -v "npm error" || true
	@$(MAKE) cli.version.sync
	@NEW_VERSION=$$(grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	printf "$(COLOR_GREEN)✓ Version bumped to v$$NEW_VERSION$(COLOR_RESET)\n"

cli.version.bump.major: ## Bump major version (X.0.0)
	$(call print_header,Bumping CLI major version)
	@cd $(CLI_DIR) && npm version major --no-git-tag-version 2>&1 | grep -v "npm error" || true
	@$(MAKE) cli.version.sync
	@NEW_VERSION=$$(grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	printf "$(COLOR_GREEN)✓ Version bumped to v$$NEW_VERSION$(COLOR_RESET)\n"

cli.version.sync: ## Sync version from package.json to version.go
	@NEW_VERSION=$$(grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/'); \
	sed -i 's/Version = "[^"]*"/Version = "'$$NEW_VERSION'"/' $(CLI_DIR)/internal/version/version.go; \
	echo "Synced version to $$NEW_VERSION in version.go"

cli.release.prepare: cli.build.all ## Prepare release: build all platforms and copy to install/releases/
	$(call print_header,Preparing CLI release v$(CLI_VERSION))
	@mkdir -p $(CLI_DIR)/install/releases/v$(CLI_VERSION)
	@cp $(CLI_DIR)/dist/* $(CLI_DIR)/install/releases/v$(CLI_VERSION)/
	@echo "v$(CLI_VERSION)" > $(CLI_DIR)/install/releases/latest.txt
	$(call print_success,Release v$(CLI_VERSION) prepared in install/releases/)
	$(call print_info,Distribution files:)
	@ls -lh $(CLI_DIR)/install/releases/v$(CLI_VERSION)/

cli.release.publish: cli.build ## Publish release: deploy install directory to install.godeploy.com
	$(call print_header,Publishing CLI release v$(CLI_VERSION))
	@cd $(CLI_DIR) && ./out/$(BINARY_NAME) deploy
	$(call print_success,Release v$(CLI_VERSION) published to install.godeploy.com)

cli.release: cli.release.prepare cli.release.publish ## Complete release workflow: prepare and publish
	$(call print_success,CLI v$(CLI_VERSION) released successfully!)

