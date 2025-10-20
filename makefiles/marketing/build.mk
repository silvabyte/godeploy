# Marketing app build tasks

MARKETING_DIR := $(APPS_DIR)/marketing
MARKETING_PACKAGE := @godeploy/marketing

.PHONY: marketing.build marketing.build.clean

marketing.build: ## Build marketing with Next.js
	$(call print_header,Building marketing)
	@cd $(PROJECT_ROOT) && $(BUN) run --filter $(MARKETING_PACKAGE) build
	$(call print_success,Marketing build completed: $(MARKETING_DIR)/.next)

marketing.build.clean: marketing.clean marketing.build ## Clean and build marketing

