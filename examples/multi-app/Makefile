.PHONY: build-apps build-godeploy run-demo run-demo-local check-install-godeploy

# Build all frontend applications
build-apps:
	@echo "Building frontend applications..."
	@cd home && npm install && npm run build
	@cd dashboard && npm install && npm run build
	@cd auth && npm install && npm run build

# Build the godeploy binary from source
build-godeploy:
	@echo "Building godeploy binary..."
	@cd ../../ && make build && cp out/godeploy ./examples/multi-app/

# Check and install godeploy if not present
check-install-godeploy:
	@if ! command -v godeploy &> /dev/null; then \
		echo "Installing godeploy..."; \
		curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash; \
	fi

# Run the demo using local binary
run-demo-local: build-apps build-godeploy
	@echo "Running demo with local binary..."
	./godeploy serve

# Run the demo using installed godeploy
run-demo: build-apps check-install-godeploy
	@echo "Running demo with installed godeploy..."
	godeploy serve