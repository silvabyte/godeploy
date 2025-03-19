# Build the apps
.PHONY: build-apps
build-apps:
	cd home && npm install && npm run build
	cd dashboard && npm install && npm run build
	cd auth && npm install && npm run build

# Build the godeploy binary
.PHONY: build-godeploy
build-godeploy:
	cd ../../ && make build && cp out/godeploy ./examples/multi-app/

# Run the apps
.PHONY: run-apps
run-apps: build-apps build-godeploy
	./godeploy serve