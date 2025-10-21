# API development tasks

API_DIR := $(APPS_DIR)/api
API_PACKAGE := @godeploy/api

.PHONY: api.dev api.start api.test api.test.watch api.test.coverage api.typecheck api.lint api.lint.fix api.check api.check.fix api.fmt api.clean

api.dev: ## Start API in development mode with hot reload
	$(call print_header,Starting API dev server)
	@cd $(PROJECT_ROOT) && NODE_ENV=local $(BUN) --watch $(API_DIR)/src/main.ts

api.start: ## Start API in production mode
	$(call print_header,Starting API server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) start

api.test: ## Run API tests
	$(call print_header,Running API tests)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) test
	$(call print_success,API tests completed)

api.test.watch: ## Run API tests in watch mode
	$(call print_header,Running API tests in watch mode)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) test:watch

api.test.coverage: ## Run API tests with coverage
	$(call print_header,Running API tests with coverage)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) test:coverage
	$(call print_success,Coverage report generated)

api.typecheck: ## Run TypeScript type checking for API
	$(call print_header,Type checking API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) typecheck
	$(call print_success,Type check passed)

api.lint: ## Lint API code
	$(call print_header,Linting API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) lint
	$(call print_success,Lint check passed)

api.lint.fix: ## Lint and fix API code
	$(call print_header,Linting and fixing API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) lint:fix
	$(call print_success,Lint fixes applied)

api.check: ## Run biome check on API
	$(call print_header,Running biome check on API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) check
	$(call print_success,Check passed)

api.check.fix: ## Run biome check and fix on API
	$(call print_header,Running biome check and fix on API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) check:fix
	$(call print_success,Check fixes applied)

api.fmt: ## Format API code
	$(call print_header,Formatting API)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(API_PACKAGE) fmt
	$(call print_success,Code formatted)

api.clean: ## Clean API build artifacts
	$(call print_header,Cleaning API artifacts)
	@rm -rf $(API_DIR)/dist $(API_DIR)/coverage
	$(call print_success,API cleaned)

