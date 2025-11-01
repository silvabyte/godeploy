# Database operations using Supabase CLI

.PHONY: db.new db.up db.push db.pull db.reset db.status

db.new: ## Create a new database migration
	$(call print_header,Creating new database migration)
	@$(BUNX) supabase migration new $(filter-out $@,$(MAKECMDGOALS))
	$(call print_success,Migration created)

db.up: ## Apply pending migrations
	$(call print_header,Applying pending migrations)
	@$(BUNX) supabase migration up
	$(call print_success,Migrations applied)

db.push: ## Push local migrations to remote database
	$(call print_header,Pushing migrations to remote database)
	@$(BUNX) supabase db push
	$(call print_success,Migrations pushed)

db.pull: ## Pull schema from remote database
	$(call print_header,Pulling schema from remote database)
	@$(BUNX) supabase db pull
	$(call print_success,Schema pulled)

db.reset: ## Reset local database (WARNING: destructive)
	$(call print_header,Resetting local database)
	@$(BUNX) supabase db reset
	$(call print_success,Database reset)

db.status: ## Show migration status
	$(call print_header,Database migration status)
	@$(BUNX) supabase migration list

# Catch-all target to allow arguments to db.new
%:
	@:

