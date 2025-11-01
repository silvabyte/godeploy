# Marketing app deployment tasks

MARKETING_DIR := $(APPS_DIR)/marketing

.PHONY: marketing.deploy marketing.deploy.check

marketing.deploy: marketing.build ## Build and deploy marketing to godeploy
	$(call print_header,Deploying marketing)
	@cd $(MARKETING_DIR) && godeploy deploy
	$(call print_success,Marketing deployed)

marketing.deploy.check: ## Check marketing deployment configuration
	$(call print_header,Checking marketing deployment config)
	@cd $(MARKETING_DIR) && cat godeploy.config.json

