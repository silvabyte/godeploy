# API deployment tasks (Docker operations)

DOCKER_IMAGE := godeploy-api
DOCKER_CONTAINER := godeploy-api
DOCKER_PORT := 38444

.PHONY: api.deploy api.docker.run api.docker.stop api.docker.restart api.docker.logs api.docker.remove api.docker.status

api.deploy: api.docker.stop api.docker.remove api.build api.docker.run ## Full deploy: stop, remove, build, run

api.docker.run: ## Run API Docker container
	$(call print_header,Starting API Docker container)
	@docker run -d --name $(DOCKER_CONTAINER) -p $(DOCKER_PORT):38444 $(DOCKER_IMAGE):$(DOCKER_TAG)
	$(call print_success,API container running on port $(DOCKER_PORT))

api.docker.stop: ## Stop API Docker container
	$(call print_header,Stopping API Docker container)
	@docker stop $(DOCKER_CONTAINER) 2>/dev/null || true
	$(call print_success,API container stopped)

api.docker.restart: ## Restart API Docker container
	$(call print_header,Restarting API Docker container)
	@docker restart $(DOCKER_CONTAINER)
	$(call print_success,API container restarted)

api.docker.logs: ## Follow API Docker container logs
	$(call print_header,Showing API container logs)
	@docker logs -f $(DOCKER_CONTAINER)

api.docker.remove: ## Remove API Docker container
	$(call print_header,Removing API Docker container)
	@docker rm $(DOCKER_CONTAINER) 2>/dev/null || true
	$(call print_success,API container removed)

api.docker.status: ## Show API Docker container status
	$(call print_header,API container status)
	@docker ps -a --filter name=$(DOCKER_CONTAINER)

