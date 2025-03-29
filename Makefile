.PHONY: all test build clean run deps build-linux release dry-run tag get-version bump-major bump-minor bump-patch

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


# Run all
all: test build

# Run tests
test: 
	$(GOTEST) -v ./...

# Build the project
build: 
	$(GOBUILD) -o $(OUT_DIR)/$(BINARY_NAME) ./cmd/${BINARY_NAME} 

# Clean build files
clean: 
	$(GOCLEAN)
	rm -f $(OUT_DIR)/$(BINARY_NAME)
	rm -f $(OUT_DIR)/$(BINARY_UNIX)
	rm -f $(OUT_DIR)/$(BINARY_MAC)
	rm -f $(OUT_DIR)/$(BINARY_WIN)
	rm -f $(OUT_DIR)/$(BINARY_ARM64)
	rm -rf dist/

# Run the application
run: build
	./$(OUT_DIR)/$(BINARY_NAME)

# Install dependencies
deps:
	$(GOGET) 

# Cross-compilation for Linux
build-linux:
	GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(OUT_DIR)/$(BINARY_UNIX) ./cmd/${BINARY_NAME}

# Cross-compilation for Raspberry Pi (ARM64)
build-arm64:
	GOOS=linux GOARCH=arm64 $(GOBUILD) -o $(OUT_DIR)/$(BINARY_ARM64) ./cmd/${BINARY_NAME}

# Cross-compilation for all platforms
build-all:
	mkdir -p dist
	# macOS (Intel)
	GOOS=darwin GOARCH=amd64 $(GOBUILD) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-darwin-amd64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)
	
	# macOS (Apple Silicon)
	GOOS=darwin GOARCH=arm64 $(GOBUILD) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-darwin-arm64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)
	
	# Linux (x86_64)
	GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-linux-amd64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)
	
	# Linux (ARM64)
	GOOS=linux GOARCH=arm64 $(GOBUILD) -o $(BINARY_NAME) ./cmd/${BINARY_NAME}
	tar -czf dist/godeploy-linux-arm64.tar.gz $(BINARY_NAME)
	rm $(BINARY_NAME)
	
	# Windows (x86_64)
	GOOS=windows GOARCH=amd64 $(GOBUILD) -o $(BINARY_NAME).exe ./cmd/${BINARY_NAME}
	zip dist/godeploy-windows-amd64.zip $(BINARY_NAME).exe
	rm $(BINARY_NAME).exe