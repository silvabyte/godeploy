# CLI release tasks

CLI_DIR := $(APPS_DIR)/cli
CLI_VERSION := $(shell grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

.PHONY: cli.version cli.release.create cli.release.create.patch cli.release.create.minor cli.release.create.major cli.release cli.release.prepare cli.release.publish

cli.version: ## Show CLI version
	@printf "v$(CLI_VERSION)\n"

cli.release.create.patch: ## Create patch release (x.x.X) with xrelease
	$(call print_header,Creating CLI patch release with xrelease)
	@cd $(CLI_DIR) && xrelease create -p

cli.release.create.minor: ## Create minor release (x.X.0) with xrelease
	$(call print_header,Creating CLI minor release with xrelease)
	@cd $(CLI_DIR) && xrelease create -m

cli.release.create.major: ## Create major release (X.0.0) with xrelease
	$(call print_header,Creating CLI major release with xrelease)
	@cd $(CLI_DIR) && xrelease create -M

cli.release.create: cli.release.create.patch ## Create release (alias for patch)

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

cli.release: cli.release.create.patch cli.release.prepare cli.release.publish ## Complete release workflow: prepare and publish
	$(call print_success,CLI v$(CLI_VERSION) released successfully!)

