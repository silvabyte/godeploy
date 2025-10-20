# Auth app build tasks

AUTH_DIR := $(APPS_DIR)/auth
AUTH_PACKAGE := @godeploy/auth

.PHONY: auth.build auth.build.clean

auth.build: ## Build auth app for production
	$(call print_header,Building auth app)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) build
	$(call print_success,Auth build completed: $(AUTH_DIR)/dist)

auth.build.clean: auth.clean auth.build ## Clean and build auth app

