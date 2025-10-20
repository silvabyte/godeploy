# Dashboard app build tasks

DASHBOARD_DIR := $(APPS_DIR)/dashboard
DASHBOARD_PACKAGE := @godeploy/ui

.PHONY: dashboard.build dashboard.build.clean

dashboard.build: ## Build dashboard for production
	$(call print_header,Building dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) build
	$(call print_success,Dashboard build completed: $(DASHBOARD_DIR)/dist)

dashboard.build.clean: dashboard.clean dashboard.build ## Clean and build dashboard

