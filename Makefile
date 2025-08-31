.PHONY: all test build clean run deps build-linux release dry-run tag get-version bump-major bump-minor bump-patch lint lint-fix lint-install audit audit-install deadcode fmt fmt-install migrate-check

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get

BINARY_NAME=godeploy
BINARY_UNIX=$(BINARY_NAME)_unix
BINARY_MAC=$(BINARY_NAME)_mac
BINARY_WIN=$(BINARY_NAME).exe
BINARY_ARM64=$(BINARY_NAME)_arm64
OUT_DIR=out

# Version information
VERSION=$(shell grep '"version":' package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
LDFLAGS=-ldflags "-X github.com/audetic/godeploy/internal/version.Version=$(VERSION)"


# Run all
all: test build

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Build the project
build:
	$(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_NAME) ./cmd/${BINARY_NAME}

# Clean build files
clean:
	$(GOCLEAN)
	rm -f $(OUT_DIR)/$(BINARY_NAME)
	rm -f $(OUT_DIR)/$(BINARY_UNIX)
	rm -f $(OUT_DIR)/$(BINARY_MAC)
	rm -f $(OUT_DIR)/$(BINARY_WIN)
	rm -f $(OUT_DIR)/$(BINARY_ARM64)
	rm -rf dist/
	rm -f coverage.out coverage.html

# Run the application
run: build
	./$(OUT_DIR)/$(BINARY_NAME)

# Install dependencies
deps:
	$(GOGET)
	go mod download
	go mod tidy
	go mod verify

# Linting and code quality
lint:
	@./scripts/lint.sh

lint-fix:
	@echo "Auto-fixing code issues..."
	@go fmt ./...
	@goimports -w .

lint-install:
	@echo "Installing linting tools..."
	@go install honnef.co/go/tools/cmd/staticcheck@latest
	@go install github.com/gordonklaus/ineffassign@latest
	@go install github.com/remyoudompheng/go-misc/deadcode@latest
	@go install github.com/kisielk/errcheck@latest
	@go install golang.org/x/tools/cmd/goimports@latest

# Security audit
audit:
	@echo "Running security audit..."
	@go list -json -deps ./... | nancy sleuth
	@gosec ./...

audit-install:
	@echo "Installing security audit tools..."
	@go install github.com/sonatype-nexus-community/nancy@latest
	@go install github.com/securego/gosec/v2/cmd/gosec@latest

# Dead code detection (specific check)
deadcode:
	@echo "Checking for dead code..."
	@./bin/golangci-lint run --disable-all --enable deadcode,unused,unparam,ineffassign

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...
	@gofumpt -w .

fmt-install:
	@echo "Installing gofumpt..."
	@go install mvdan.cc/gofumpt@latest

# Migration check for SaaS-only
migrate-check:
	@echo "Checking for OSS references to remove..."
	@grep -r "package\|serve\|docker\|nginx" --include="*.go" cmd/ internal/ | grep -v "package main\|package api\|package auth\|package config\|package version" || true

# Cross-compilation for Linux
build-linux:
	GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_UNIX) ./cmd/${BINARY_NAME}

# Cross-compilation for Raspberry Pi (ARM64)
build-arm64:
	GOOS=linux GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(OUT_DIR)/$(BINARY_ARM64) ./cmd/${BINARY_NAME}

# Cross-compilation for all platforms
build-all:
	mkdir -p dist
	# macOS (Intel)
	GOOS=darwin GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-darwin-amd64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)

	# macOS (Apple Silicon)
	GOOS=darwin GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-darwin-arm64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)

	# Linux (x86_64)
	GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-linux-amd64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)

	# Linux (ARM64)
	GOOS=linux GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-linux-arm64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)

	# Windows (x86_64)
	GOOS=windows GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BINARY_NAME).exe ./cmd/${BINARY_NAME}
	zip dist/godeploy-windows-amd64.zip $(BINARY_NAME).exe
	rm $(BINARY_NAME).exe