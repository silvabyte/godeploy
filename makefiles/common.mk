# Common variables and utilities for godeploy monorepo

# Project paths
PROJECT_ROOT := $(shell pwd)
APPS_DIR := $(PROJECT_ROOT)/apps
LIBS_DIR := $(PROJECT_ROOT)/libs

# Bun executables
BUN := bun
BUNX := bunx

# Color codes for output (using tput for better compatibility)
COLOR_RESET := $(shell tput sgr0 2>/dev/null || echo "")
COLOR_BOLD := $(shell tput bold 2>/dev/null || echo "")
COLOR_RED := $(shell tput setaf 1 2>/dev/null || echo "")
COLOR_GREEN := $(shell tput setaf 2 2>/dev/null || echo "")
COLOR_YELLOW := $(shell tput setaf 3 2>/dev/null || echo "")
COLOR_BLUE := $(shell tput setaf 4 2>/dev/null || echo "")
COLOR_MAGENTA := $(shell tput setaf 5 2>/dev/null || echo "")
COLOR_CYAN := $(shell tput setaf 6 2>/dev/null || echo "")

# Helper functions
define print_header
	@printf '%s%s==> %s%s\n' '$(COLOR_BOLD)' '$(COLOR_CYAN)' '$(strip $(1))' '$(COLOR_RESET)'
endef

define print_success
	@printf '%s✓ %s%s\n' '$(COLOR_GREEN)' '$(strip $(1))' '$(COLOR_RESET)'
endef

define print_error
	@printf '%s✗ %s%s\n' '$(COLOR_RED)' '$(strip $(1))' '$(COLOR_RESET)'
endef

define print_info
	@printf '%sℹ %s%s\n' '$(COLOR_BLUE)' '$(strip $(1))' '$(COLOR_RESET)'
endef

define print_warning
	@printf '%s⚠ %s%s\n' '$(COLOR_YELLOW)' '$(strip $(1))' '$(COLOR_RESET)'
endef

# Version detection from root package.json
VERSION := $(shell grep '"version":' package.json | head -1 | sed -E 's/.*"version": "([^"]+)".*/\1/')

# Common workspace filter command helper
define bun_workspace
	$(BUN) run --filter $(1) $(2)
endef

# Check if command exists
define command_exists
	$(shell command -v $(1) 2> /dev/null)
endef

