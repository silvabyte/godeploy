# Dashboard app development tasks

DASHBOARD_DIR := $(APPS_DIR)/dashboard
DASHBOARD_PACKAGE := @godeploy/ui

.PHONY: dashboard.dev dashboard.preview dashboard.test dashboard.test.watch dashboard.typecheck dashboard.lint dashboard.lint.fix dashboard.check dashboard.check.fix dashboard.fmt dashboard.clean dashboard.knip

dashboard.dev: ## Start dashboard in development mode
	$(call print_header,Starting dashboard dev server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) dev

dashboard.preview: ## Preview dashboard production build
	$(call print_header,Starting dashboard preview server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) preview

dashboard.test: ## Run dashboard tests
	$(call print_header,Running dashboard tests)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) test
	$(call print_success,Dashboard tests completed)

dashboard.test.watch: ## Run dashboard tests in watch mode
	$(call print_header,Running dashboard tests in watch mode)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) test:watch

dashboard.typecheck: ## Run TypeScript type checking for dashboard
	$(call print_header,Type checking dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) typecheck
	$(call print_success,Type check passed)

dashboard.lint: ## Lint dashboard code
	$(call print_header,Linting dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) lint
	$(call print_success,Lint check passed)

dashboard.lint.fix: ## Lint and fix dashboard code
	$(call print_header,Linting and fixing dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) lint:fix
	$(call print_success,Lint fixes applied)

dashboard.check: ## Run biome check on dashboard
	$(call print_header,Running biome check on dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) check
	$(call print_success,Check passed)

dashboard.check.fix: ## Run biome check and fix on dashboard
	$(call print_header,Running biome check and fix on dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) check:fix
	$(call print_success,Check fixes applied)

dashboard.fmt: ## Format dashboard code
	$(call print_header,Formatting dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) fmt
	$(call print_success,Code formatted)

dashboard.knip: ## Run knip on dashboard to find unused exports
	$(call print_header,Running knip on dashboard)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(DASHBOARD_PACKAGE) knip

dashboard.clean: ## Clean dashboard build artifacts
	$(call print_header,Cleaning dashboard artifacts)
	@rm -rf $(DASHBOARD_DIR)/dist
	$(call print_success,Dashboard cleaned)

