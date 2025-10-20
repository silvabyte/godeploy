# Auth app development tasks

AUTH_DIR := $(APPS_DIR)/auth
AUTH_PACKAGE := @godeploy/auth

.PHONY: auth.dev auth.preview auth.test auth.test.watch auth.typecheck auth.lint auth.lint.fix auth.check auth.check.fix auth.fmt auth.clean

auth.dev: ## Start auth app in development mode
	$(call print_header,Starting auth dev server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) dev

auth.preview: ## Preview auth production build
	$(call print_header,Starting auth preview server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) preview

auth.test: ## Run auth tests
	$(call print_header,Running auth tests)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) test
	$(call print_success,Auth tests completed)

auth.test.watch: ## Run auth tests in watch mode
	$(call print_header,Running auth tests in watch mode)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) test:watch

auth.typecheck: ## Run TypeScript type checking for auth
	$(call print_header,Type checking auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) typecheck
	$(call print_success,Type check passed)

auth.lint: ## Lint auth code
	$(call print_header,Linting auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) lint
	$(call print_success,Lint check passed)

auth.lint.fix: ## Lint and fix auth code
	$(call print_header,Linting and fixing auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) lint:fix
	$(call print_success,Lint fixes applied)

auth.check: ## Run biome check on auth
	$(call print_header,Running biome check on auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) check
	$(call print_success,Check passed)

auth.check.fix: ## Run biome check and fix on auth
	$(call print_header,Running biome check and fix on auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) check:fix
	$(call print_success,Check fixes applied)

auth.fmt: ## Format auth code
	$(call print_header,Formatting auth)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(AUTH_PACKAGE) fmt
	$(call print_success,Code formatted)

auth.clean: ## Clean auth build artifacts
	$(call print_header,Cleaning auth artifacts)
	@rm -rf $(AUTH_DIR)/dist $(AUTH_DIR)/deploy
	$(call print_success,Auth cleaned)

