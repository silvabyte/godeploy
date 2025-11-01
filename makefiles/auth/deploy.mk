# Auth app deployment tasks

AUTH_DIR := $(APPS_DIR)/auth

.PHONY: auth.deploy auth.deploy.check

auth.deploy: auth.build ## Build and deploy auth app to godeploy
	$(call print_header,Deploying auth app)
	@cd $(AUTH_DIR) && godeploy deploy
	$(call print_success,Auth deployed)

auth.deploy.check: ## Check auth deployment configuration
	$(call print_header,Checking auth deployment config)
	@cd $(AUTH_DIR) && cat godeploy.config.json

