# GoDeploy Monorepo Makefile
# Manages all apps: api, auth, dashboard, marketing, cli

.DEFAULT_GOAL := help

# Include common utilities first
include makefiles/common.mk

# Include database operations
include makefiles/db.mk

# Include app-specific makefiles
include makefiles/api/dev.mk
include makefiles/api/build.mk
include makefiles/api/deploy.mk

include makefiles/auth/dev.mk
include makefiles/auth/build.mk
include makefiles/auth/deploy.mk

include makefiles/dashboard/dev.mk
include makefiles/dashboard/build.mk
include makefiles/dashboard/deploy.mk

include makefiles/marketing/dev.mk
include makefiles/marketing/build.mk
include makefiles/marketing/deploy.mk

include makefiles/cli/dev.mk
include makefiles/cli/build.mk
include makefiles/cli/deploy.mk

# Global targets
.PHONY: help install all.clean all.test all.lint all.typecheck all.fmt all.build all.check all.check.fix all.knip

help: ## Show this help message
	@printf "$(COLOR_BOLD)$(COLOR_CYAN)GoDeploy Monorepo - Available Commands$(COLOR_RESET)\n"
	@printf "\n"
	@printf "$(COLOR_BOLD)Global Commands:$(COLOR_RESET)\n"
	@grep -E '^[a-zA-Z_.-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v "include" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_GREEN)%-25s$(COLOR_RESET) %s\n", $$1, $$2}'
	@printf "\n"
	@printf "$(COLOR_BOLD)App-Specific Commands:$(COLOR_RESET)\n"
	@printf "  $(COLOR_YELLOW)API:$(COLOR_RESET)        make api.<command>       (dev, test, build, deploy, etc.)\n"
	@printf "  $(COLOR_YELLOW)Auth:$(COLOR_RESET)       make auth.<command>      (dev, test, build, deploy, etc.)\n"
	@printf "  $(COLOR_YELLOW)Dashboard:$(COLOR_RESET)  make dashboard.<command> (dev, test, build, deploy, etc.)\n"
	@printf "  $(COLOR_YELLOW)Marketing:$(COLOR_RESET)  make marketing.<command> (dev, build, deploy, etc.)\n"
	@printf "  $(COLOR_YELLOW)CLI:$(COLOR_RESET)        make cli.<command>       (test, build, deploy, etc.)\n"
	@printf "\n"
	@printf "$(COLOR_BOLD)Database Commands:$(COLOR_RESET)\n"
	@printf "  $(COLOR_MAGENTA)db.new$(COLOR_RESET)     Create new migration\n"
	@printf "  $(COLOR_MAGENTA)db.up$(COLOR_RESET)      Apply pending migrations\n"
	@printf "  $(COLOR_MAGENTA)db.push$(COLOR_RESET)    Push migrations to remote\n"
	@printf "  $(COLOR_MAGENTA)db.pull$(COLOR_RESET)    Pull schema from remote\n"
	@printf "  $(COLOR_MAGENTA)db.reset$(COLOR_RESET)   Reset local database\n"
	@printf "\n"
	@printf "$(COLOR_BOLD)Examples:$(COLOR_RESET)\n"
	@printf "  make api.dev          Start API dev server\n"
	@printf "  make auth.build       Build auth app\n"
	@printf "  make dashboard.test   Run dashboard tests\n"
	@printf "  make cli.build.all    Build CLI for all platforms\n"
	@printf "  make all.test         Run all tests\n"
	@printf "\n"

install: ## Install all dependencies
	$(call print_header,Installing dependencies for all apps)
	@$(BUN) install
	@cd $(CLI_DIR) && go mod download
	$(call print_success,All dependencies installed)

all.clean: api.clean auth.clean dashboard.clean marketing.clean cli.clean ## Clean all build artifacts
	$(call print_header,Cleaning all build artifacts)
	@rm -rf node_modules
	$(call print_success,All artifacts cleaned)

all.test: ## Run all tests (API, Auth, Dashboard, CLI)
	$(call print_header,Running all tests)
	@$(MAKE) api.test
	@$(MAKE) auth.test
	@$(MAKE) dashboard.test
	@$(MAKE) cli.test
	$(call print_success,All tests completed)

all.lint: ## Lint workspace with biome
	$(call print_header,Linting workspace)
	@$(BUNX) biome lint .
	$(call print_success,Workspace lint passed)

all.typecheck: ## Type check all TypeScript apps
	$(call print_header,Type checking all apps)
	@$(MAKE) api.typecheck
	@$(MAKE) auth.typecheck
	@$(MAKE) dashboard.typecheck
	@$(MAKE) marketing.typecheck
	$(call print_success,All type checks passed)

all.fmt: ## Format workspace with biome
	$(call print_header,Formatting workspace)
	@$(BUNX) biome format --write .
	$(call print_success,Workspace formatted)

all.build: ## Build all apps
	$(call print_header,Building all apps)
	@$(MAKE) api.build
	@$(MAKE) auth.build
	@$(MAKE) dashboard.build
	@$(MAKE) marketing.build
	@$(MAKE) cli.build
	$(call print_success,All apps built)

all.check: ## Check workspace with biome
	$(call print_header,Checking workspace)
	@$(BUNX) biome check .
	$(call print_success,Workspace check passed)

all.check.fix: ## Check and fix workspace with biome
	$(call print_header,Checking and fixing workspace)
	@$(BUNX) biome check --write .
	$(call print_success,Workspace fixes applied)

all.knip: ## Run knip on entire workspace
	$(call print_header,Running knip on workspace)
	@$(BUNX) knip
	$(call print_success,Knip analysis complete)

# Version information
.PHONY: version

version: ## Show version information
	$(call print_header,Version Information)
	@printf "Workspace: $(VERSION)\n"
	@printf "CLI:       $(shell grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')\n"
	@printf "API:       $(shell grep '"version":' $(APPS_DIR)/api/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')\n"
	@printf "Auth:      $(shell grep '"version":' $(APPS_DIR)/auth/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')\n"
	@printf "Dashboard: $(shell grep '"version":' $(APPS_DIR)/dashboard/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')\n"
	@printf "Marketing: $(shell grep '"version":' $(APPS_DIR)/marketing/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')\n"

