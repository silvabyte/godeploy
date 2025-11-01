# CLI build tasks

CLI_DIR := $(APPS_DIR)/cli
GOCMD := go
GOBUILD := $(GOCMD) build

BINARY_NAME := godeploy
OUT_DIR := $(CLI_DIR)/out

# Get version from CLI package.json
CLI_VERSION := $(shell grep '"version":' $(CLI_DIR)/package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
LDFLAGS := -ldflags "-X github.com/silvabyte/godeploy/internal/version.Version=$(CLI_VERSION)"

.PHONY: cli.build cli.build.linux cli.build.arm64 cli.build.mac cli.build.mac.arm64 cli.build.windows cli.build.all cli.run

cli.build: ## Build CLI for current platform
	$(call print_header,Building CLI)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME) ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built: $(OUT_DIR)/$(BINARY_NAME))

cli.build.linux: ## Build CLI for Linux (x86_64)
	$(call print_header,Building CLI for Linux x86_64)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME)_linux_amd64 ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built for Linux: $(OUT_DIR)/$(BINARY_NAME)_linux_amd64)

cli.build.arm64: ## Build CLI for Linux ARM64
	$(call print_header,Building CLI for Linux ARM64)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && GOOS=linux GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME)_linux_arm64 ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built for ARM64: $(OUT_DIR)/$(BINARY_NAME)_linux_arm64)

cli.build.mac: ## Build CLI for macOS (Intel)
	$(call print_header,Building CLI for macOS Intel)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && GOOS=darwin GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME)_darwin_amd64 ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built for macOS Intel: $(OUT_DIR)/$(BINARY_NAME)_darwin_amd64)

cli.build.mac.arm64: ## Build CLI for macOS (Apple Silicon)
	$(call print_header,Building CLI for macOS Apple Silicon)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && GOOS=darwin GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME)_darwin_arm64 ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built for macOS Apple Silicon: $(OUT_DIR)/$(BINARY_NAME)_darwin_arm64)

cli.build.windows: ## Build CLI for Windows
	$(call print_header,Building CLI for Windows)
	@mkdir -p $(OUT_DIR)
	@cd $(CLI_DIR) && GOOS=windows GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME).exe ./cmd/$(BINARY_NAME)
	$(call print_success,CLI built for Windows: $(OUT_DIR)/$(BINARY_NAME).exe)

cli.build.all: ## Build CLI for all platforms and create distribution archives
	$(call print_header,Building CLI for all platforms)
	@mkdir -p $(CLI_DIR)/dist
	@cd $(CLI_DIR) && GOOS=darwin GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/$(BINARY_NAME)
	@cd $(CLI_DIR) && tar -czf dist/godeploy-darwin-amd64.tar.gz $(BINARY_NAME) && rm $(BINARY_NAME)
	@cd $(CLI_DIR) && GOOS=darwin GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/$(BINARY_NAME)
	@cd $(CLI_DIR) && tar -czf dist/godeploy-darwin-arm64.tar.gz $(BINARY_NAME) && rm $(BINARY_NAME)
	@cd $(CLI_DIR) && GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/$(BINARY_NAME)
	@cd $(CLI_DIR) && tar -czf dist/godeploy-linux-amd64.tar.gz $(BINARY_NAME) && rm $(BINARY_NAME)
	@cd $(CLI_DIR) && GOOS=linux GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/$(BINARY_NAME)
	@cd $(CLI_DIR) && tar -czf dist/godeploy-linux-arm64.tar.gz $(BINARY_NAME) && rm $(BINARY_NAME)
	@cd $(CLI_DIR) && GOOS=windows GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME).exe ./cmd/$(BINARY_NAME)
	@cd $(CLI_DIR) && zip dist/godeploy-windows-amd64.zip $(BINARY_NAME).exe && rm $(BINARY_NAME).exe
	$(call print_success,All platform builds completed in $(CLI_DIR)/dist/)

cli.run: cli.build ## Build and run CLI
	$(call print_header,Running CLI)
	@$(OUT_DIR)/$(BINARY_NAME)

