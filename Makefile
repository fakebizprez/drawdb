# DrawDB Docker Compose Management
# Usage: make [command]

.PHONY: help dev prod build up down logs clean backup test lint

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

# Default target
help: ## Show this help message
	@echo "$(BLUE)DrawDB Docker Compose Commands$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development Environment
dev: ## Start development environment with hot reload
	@echo "$(YELLOW)Starting DrawDB development environment...$(RESET)"
	@cp docker/env.development.template .env.development 2>/dev/null || true
	@docker-compose -f docker-compose.development.yml up -d
	@echo "$(GREEN)Development environment started!$(RESET)"
	@echo "$(BLUE)Frontend:$(RESET) http://localhost:5173"
	@echo "$(BLUE)Backend:$(RESET) http://localhost:3001"
	@echo "$(BLUE)MailHog:$(RESET) http://localhost:8025"
	@echo "$(BLUE)pgAdmin:$(RESET) http://localhost:8080"

dev-logs: ## Follow development logs
	@docker-compose -f docker-compose.development.yml logs -f

dev-down: ## Stop development environment
	@echo "$(YELLOW)Stopping development environment...$(RESET)"
	@docker-compose -f docker-compose.development.yml down
	@echo "$(GREEN)Development environment stopped.$(RESET)"

# Production Environment
prod: ## Start production environment
	@echo "$(YELLOW)Starting DrawDB production environment...$(RESET)"
	@cp docker/env.production.template .env.production 2>/dev/null || true
	@echo "$(RED)WARNING: Make sure to configure .env.production with your settings!$(RESET)"
	@docker-compose -f docker-compose.production.yml up -d
	@echo "$(GREEN)Production environment started!$(RESET)"
	@echo "$(BLUE)Application:$(RESET) http://localhost"
	@echo "$(BLUE)Monitoring:$(RESET) http://localhost:9090"

prod-logs: ## Follow production logs
	@docker-compose -f docker-compose.production.yml logs -f

prod-down: ## Stop production environment
	@echo "$(YELLOW)Stopping production environment...$(RESET)"
	@docker-compose -f docker-compose.production.yml down
	@echo "$(GREEN)Production environment stopped.$(RESET)"

# Build Commands
build-dev: ## Build development images
	@echo "$(YELLOW)Building development images...$(RESET)"
	@docker-compose -f docker-compose.development.yml build

build-prod: ## Build production images
	@echo "$(YELLOW)Building production images...$(RESET)"
	@docker-compose -f docker-compose.production.yml build

# Utility Commands
logs: ## Show logs for all services
	@docker-compose logs -f

clean: ## Clean up containers, images, and volumes
	@echo "$(YELLOW)Cleaning up Docker resources...$(RESET)"
	@docker-compose -f docker-compose.development.yml down -v --remove-orphans
	@docker-compose -f docker-compose.production.yml down -v --remove-orphans
	@docker system prune -f
	@echo "$(GREEN)Cleanup completed.$(RESET)"

backup: ## Create database backup
	@echo "$(YELLOW)Creating database backup...$(RESET)"
	@docker-compose -f docker-compose.production.yml run --rm backup
	@echo "$(GREEN)Backup completed.$(RESET)"

# Database Commands
db-migrate: ## Run database migrations (placeholder for future)
	@echo "$(YELLOW)Running database migrations...$(RESET)"
	@echo "$(BLUE)Note: Migration system not yet implemented$(RESET)"

db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(RESET)"
	@docker-compose exec postgres psql -U drawdb -d drawdb -f /docker-entrypoint-initdb.d/01-init.sql
	@echo "$(GREEN)Database seeded.$(RESET)"

db-reset: ## Reset database (DESTRUCTIVE)
	@echo "$(RED)WARNING: This will destroy all data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "\n$(YELLOW)Resetting database...$(RESET)"; \
		docker-compose down -v; \
		docker volume rm drawdb_postgres_data 2>/dev/null || true; \
		echo "$(GREEN)Database reset completed.$(RESET)"; \
	else \
		echo "\n$(BLUE)Database reset cancelled.$(RESET)"; \
	fi

# Testing and Quality
test: ## Run tests (placeholder for future)
	@echo "$(YELLOW)Running tests...$(RESET)"
	@echo "$(BLUE)Note: Test suite not yet implemented$(RESET)"

lint: ## Run linting
	@echo "$(YELLOW)Running linting...$(RESET)"
	@docker run --rm -v $(PWD):/app -w /app node:20-alpine sh -c "npm install && npm run lint"

# Environment Setup
setup-env: ## Setup environment files from templates
	@echo "$(YELLOW)Setting up environment files...$(RESET)"
	@[ ! -f .env.development ] && cp docker/env.development.template .env.development && echo "Created .env.development" || echo ".env.development already exists"
	@[ ! -f .env.production ] && cp docker/env.production.template .env.production && echo "Created .env.production" || echo ".env.production already exists"
	@echo "$(GREEN)Environment setup completed.$(RESET)"
	@echo "$(BLUE)Please edit the .env files with your configuration$(RESET)"

# Health Checks
health: ## Check health of all services
	@echo "$(YELLOW)Checking service health...$(RESET)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)Frontend Health:$(RESET)"
	@curl -f http://localhost:5173 >/dev/null 2>&1 && echo "$(GREEN)✓ Frontend is healthy$(RESET)" || echo "$(RED)✗ Frontend is down$(RESET)"
	@echo "$(BLUE)Backend Health:$(RESET)"
	@curl -f http://localhost:3001/health >/dev/null 2>&1 && echo "$(GREEN)✓ Backend is healthy$(RESET)" || echo "$(RED)✗ Backend is down$(RESET)"

# Update existing compose.yml to point to development by default
update-default: ## Update default compose.yml to use development config
	@echo "$(YELLOW)Updating default docker-compose.yml...$(RESET)"
	@ln -sf docker-compose.development.yml docker-compose.yml
	@echo "$(GREEN)Default compose.yml now points to development config$(RESET)"