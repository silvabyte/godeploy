# CLI development tasks

CLI_DIR := $(APPS_DIR)/cli
GOCMD := go
GOTEST := $(GOCMD) test
GOFMT := $(GOCMD) fmt
GOGET := $(GOCMD) get

.PHONY: cli.test cli.test.coverage cli.lint cli.lint.fix cli.lint.install cli.fmt cli.fmt.install cli.deps cli.clean cli.audit cli.audit.install cli.deadcode

cli.test: ## Run CLI tests
	$(call print_header,Running CLI tests)
	@cd $(CLI_DIR) && $(GOTEST) -v ./...
	$(call print_success,CLI tests completed)

cli.test.coverage: ## Run CLI tests with coverage
	$(call print_header,Running CLI tests with coverage)
	@cd $(CLI_DIR) && $(GOTEST) -v -coverprofile=coverage.out ./...
	@cd $(CLI_DIR) && $(GOCMD) tool cover -html=coverage.out -o coverage.html
	$(call print_success,Coverage report generated: $(CLI_DIR)/coverage.html)

cli.lint: ## Lint CLI code
	$(call print_header,Linting CLI)
	@cd $(CLI_DIR) && ./scripts/lint.sh
	$(call print_success,Lint check passed)

cli.lint.fix: ## Auto-fix CLI code issues
	$(call print_header,Auto-fixing CLI code)
	@cd $(CLI_DIR) && $(GOFMT) ./...
	@cd $(CLI_DIR) && goimports -w .
	$(call print_success,Lint fixes applied)

cli.lint.install: ## Install CLI linting tools
	$(call print_header,Installing CLI linting tools)
	@go install honnef.co/go/tools/cmd/staticcheck@latest
	@go install github.com/gordonklaus/ineffassign@latest
	@go install github.com/remyoudompheng/go-misc/deadcode@latest
	@go install github.com/kisielk/errcheck@latest
	@go install golang.org/x/tools/cmd/goimports@latest
	@go install github.com/mgechev/revive@latest
	$(call print_success,Linting tools installed)

cli.fmt: ## Format CLI code
	$(call print_header,Formatting CLI)
	@cd $(CLI_DIR) && $(GOFMT) ./...
	@cd $(CLI_DIR) && gofumpt -w .
	$(call print_success,Code formatted)

cli.fmt.install: ## Install gofumpt
	$(call print_header,Installing gofumpt)
	@go install mvdan.cc/gofumpt@latest
	$(call print_success,gofumpt installed)

cli.deps: ## Install CLI dependencies
	$(call print_header,Installing CLI dependencies)
	@cd $(CLI_DIR) && $(GOGET)
	@cd $(CLI_DIR) && go mod download
	@cd $(CLI_DIR) && go mod tidy
	@cd $(CLI_DIR) && go mod verify
	$(call print_success,Dependencies installed)

cli.audit: ## Run security audit on CLI
	$(call print_header,Running security audit on CLI)
	@cd $(CLI_DIR) && go list -json -deps ./... | nancy sleuth
	@cd $(CLI_DIR) && gosec ./...
	$(call print_success,Security audit completed)

cli.audit.install: ## Install security audit tools
	$(call print_header,Installing security audit tools)
	@go install github.com/sonatype-nexus-community/nancy@latest
	@go install github.com/securego/gosec/v2/cmd/gosec@latest
	$(call print_success,Audit tools installed)

cli.deadcode: ## Check for dead code in CLI
	$(call print_header,Checking for dead code in CLI)
	@cd $(CLI_DIR) && ./bin/golangci-lint run --disable-all --enable deadcode,unused,unparam,ineffassign

cli.clean: ## Clean CLI build artifacts
	$(call print_header,Cleaning CLI artifacts)
	@cd $(CLI_DIR) && rm -rf out/ dist/ coverage.out coverage.html godeploy
	$(call print_success,CLI cleaned)

