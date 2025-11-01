# Dashboard app deployment tasks

DASHBOARD_DIR := $(APPS_DIR)/dashboard

.PHONY: dashboard.deploy dashboard.deploy.check

dashboard.deploy: dashboard.build ## Build and deploy dashboard to godeploy
	$(call print_header,Deploying dashboard)
	@cd $(DASHBOARD_DIR) && godeploy deploy
	$(call print_success,Dashboard deployed)

dashboard.deploy.check: ## Check dashboard deployment configuration
	$(call print_header,Checking dashboard deployment config)
	@test -f $(DASHBOARD_DIR)/godeploy.config.json && cat $(DASHBOARD_DIR)/godeploy.config.json || printf "No deployment config found\n"

