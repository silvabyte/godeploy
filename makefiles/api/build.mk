# API build tasks (Docker)

DOCKER_IMAGE := godeploy-api
DOCKER_TAG := latest

.PHONY: api.build api.docker.build api.docker.build.prod

api.build: api.docker.build ## Build API Docker image

api.docker.build: ## Build API Docker image for development
	$(call print_header,Building API Docker image)
	@docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) -f $(PROJECT_ROOT)/Dockerfile $(PROJECT_ROOT)
	$(call print_success,Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG))

api.docker.build.prod: ## Build API Docker image for production
	$(call print_header,Building API Docker image for production)
	@docker build -t $(DOCKER_IMAGE):$(VERSION) -f $(PROJECT_ROOT)/Dockerfile $(PROJECT_ROOT)
	@docker tag $(DOCKER_IMAGE):$(VERSION) $(DOCKER_IMAGE):latest
	$(call print_success,Docker image built: $(DOCKER_IMAGE):$(VERSION))

