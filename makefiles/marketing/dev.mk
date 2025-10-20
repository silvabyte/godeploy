# Marketing app development tasks

MARKETING_DIR := $(APPS_DIR)/marketing
MARKETING_PACKAGE := @godeploy/marketing

.PHONY: marketing.dev marketing.start marketing.typecheck marketing.lint marketing.lint.fix marketing.lint.next marketing.check marketing.check.fix marketing.fmt marketing.clean

marketing.dev: ## Start marketing in development mode
	$(call print_header,Starting marketing dev server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) dev

marketing.start: ## Start marketing in production mode
	$(call print_header,Starting marketing production server)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) start

marketing.typecheck: ## Run TypeScript type checking for marketing
	$(call print_header,Type checking marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) typecheck
	$(call print_success,Type check passed)

marketing.lint: ## Lint marketing code with biome
	$(call print_header,Linting marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) lint
	$(call print_success,Lint check passed)

marketing.lint.fix: ## Lint and fix marketing code
	$(call print_header,Linting and fixing marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) lint:fix
	$(call print_success,Lint fixes applied)

marketing.lint.next: ## Lint marketing with Next.js linter
	$(call print_header,Running Next.js linter on marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) lint:next

marketing.check: ## Run biome check on marketing
	$(call print_header,Running biome check on marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) check
	$(call print_success,Check passed)

marketing.check.fix: ## Run biome check and fix on marketing
	$(call print_header,Running biome check and fix on marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) check:fix
	$(call print_success,Check fixes applied)

marketing.fmt: ## Format marketing code
	$(call print_header,Formatting marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) fmt
	$(call print_success,Code formatted)

marketing.clean: ## Clean marketing build artifacts
	$(call print_header,Cleaning marketing artifacts)
	@rm -rf $(MARKETING_DIR)/.next $(MARKETING_DIR)/out
	$(call print_success,Marketing cleaned)

