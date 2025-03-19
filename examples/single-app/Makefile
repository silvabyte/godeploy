.PHONY: build-godeploy run-demo run-demo-local check-install-godeploy

# Build the godeploy binary from source
build-godeploy:
	@echo "Building godeploy binary..."
	@cd ../../ && make build && cp out/godeploy ./examples/single-app/

# Check and install godeploy if not present
check-install-godeploy:
	@if ! command -v godeploy &> /dev/null; then \
		echo "Installing godeploy..."; \
		curl -sSL https://install--7c574f3c-862a-4bc5-89d4-b1f11aaac65f.spa.godeploy.app/now.sh | bash; \
	fi

# Run the demo using local binary
run-demo-local: build-godeploy
	@echo "Running demo with local binary..."
	./godeploy serve

# Run the demo using installed godeploy
run-demo: check-install-godeploy
	@echo "Running demo with installed godeploy..."
	godeploy serve