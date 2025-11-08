# Synapse Language Learning App - Makefile
# Simple commands for deployment and management

.PHONY: help deploy health seed logs status restart stop start update ssh perf test build clean dev dev-rebuild dev-clean

# Configuration
VM_IP ?= 94.237.80.109
SSH_USER ?= root
APP_DIR = /opt/lexia

# Default target
help:
	@echo "╔════════════════════════════════════════╗"
	@echo "║  Synapse - Make Commands              ║"
	@echo "╚════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  make deploy          - Deploy to VM (one-command)"
	@echo "  make deploy-manual   - Show manual deployment steps"
	@echo ""
	@echo "🌱 Database:"
	@echo "  make seed            - Seed demo data on VM"
	@echo "  make seed-local      - Seed demo data locally"
	@echo "  make db-backup       - Backup database on VM"
	@echo "  make db-restore      - Restore database on VM"
	@echo "  make db-shell        - Connect to PostgreSQL"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make health          - Check health endpoints"
	@echo "  make logs            - View all logs (follow)"
	@echo "  make logs-backend    - View backend logs only"
	@echo "  make logs-db         - View database logs only"
	@echo "  make status          - Check container status"
	@echo "  make perf            - Run performance test"
	@echo ""
	@echo "🛠️  Management:"
	@echo "  make restart         - Restart all services on VM"
	@echo "  make stop            - Stop all services on VM"
	@echo "  make start           - Start all services on VM"
	@echo "  make update          - Update app on VM (pull & rebuild)"
	@echo "  make ssh             - SSH into VM"
	@echo ""
	@echo "💻 Local Development:"
	@echo "  make dev             - Start local development"
	@echo "  make dev BUILD=1     - Rebuild containers (keeps database)"
	@echo "  make dev-rebuild     - Rebuild from scratch (keeps database)"
	@echo "  make dev-clean       - Clean rebuild (deletes database!)"
	@echo "  make build           - Build backend & frontend locally"
	@echo "  make test            - Run tests"
	@echo "  make clean           - Clean build artifacts"
	@echo ""
	@echo "📝 Configuration:"
	@echo "  VM_IP=$(VM_IP)"
	@echo "  SSH_USER=$(SSH_USER)"
	@echo ""

# ============================================================================
# Deployment
# ============================================================================

deploy:
	@echo "🚀 Deploying to $(VM_IP)..."
	@./scripts/deploy-to-vm.sh $(VM_IP) $(SSH_USER)

deploy-manual:
	@echo "📖 Manual deployment guide:"
	@echo "See DEPLOY_TO_VM.md for detailed instructions"
	@cat DEPLOYMENT_READY.md

# ============================================================================
# Database
# ============================================================================

seed:
	@echo "🌱 Seeding database on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker exec lexia-backend ./lexia-seed'

seed-local:
	@echo "🌱 Seeding local database..."
	@./scripts/seed-database.sh

db-backup:
	@echo "💾 Backing up database on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker exec lexia-postgres pg_dump -U lexia synapse | gzip > backups/backup-$$(date +%Y%m%d-%H%M%S).sql.gz'
	@echo "✅ Backup created in $(APP_DIR)/backups/"

db-restore:
	@echo "⚠️  This will restore the latest backup. Are you sure? [y/N]"
	@read -r response; \
	if [ "$$response" = "y" ]; then \
		ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR)/backups && gunzip < $$(ls -t backup-*.sql.gz | head -1) | docker exec -i lexia-postgres psql -U lexia synapse'; \
		echo "✅ Database restored"; \
	else \
		echo "❌ Cancelled"; \
	fi

db-shell:
	@echo "🗄️  Connecting to PostgreSQL..."
	@ssh $(SSH_USER)@$(VM_IP) 'docker exec -it lexia-postgres psql -U lexia -d lexia'

# ============================================================================
# Monitoring
# ============================================================================

health:
	@echo "🏥 Checking health endpoints..."
	@./scripts/health-check.sh http://$(VM_IP)

logs:
	@echo "📋 Viewing all logs (Ctrl+C to exit)..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker-compose -f docker-compose.prod.yml logs -f'

logs-backend:
	@echo "📋 Viewing backend logs (Ctrl+C to exit)..."
	@ssh $(SSH_USER)@$(VM_IP) 'docker logs -f lexia-backend'

logs-db:
	@echo "📋 Viewing database logs (Ctrl+C to exit)..."
	@ssh $(SSH_USER)@$(VM_IP) 'docker logs -f lexia-postgres'

status:
	@echo "📊 Checking container status..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker-compose -f docker-compose.prod.yml ps'
	@echo ""
	@echo "🖥️  System resources:"
	@ssh $(SSH_USER)@$(VM_IP) 'docker stats --no-stream'

perf:
	@echo "⚡ Running performance test..."
	@./scripts/perf-test.sh http://$(VM_IP)/health 1000 10

# ============================================================================
# Management
# ============================================================================

restart:
	@echo "🔄 Restarting services on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker-compose -f docker-compose.prod.yml restart'
	@echo "✅ Services restarted"
	@sleep 3
	@make health

stop:
	@echo "🛑 Stopping services on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker-compose -f docker-compose.prod.yml down'
	@echo "✅ Services stopped"

start:
	@echo "▶️  Starting services on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && docker-compose -f docker-compose.prod.yml up -d'
	@echo "✅ Services started"
	@sleep 5
	@make health

update:
	@echo "🔄 Updating application on VM..."
	@echo "1. Pushing latest changes..."
	@git push
	@echo "2. Pulling on VM and rebuilding..."
	@ssh $(SSH_USER)@$(VM_IP) 'cd $(APP_DIR) && git pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d --build'
	@echo "✅ Update complete"
	@sleep 5
	@make health

ssh:
	@ssh $(SSH_USER)@$(VM_IP)

# ============================================================================
# Local Development
# ============================================================================

dev:
	@echo "💻 Starting local development..."
ifdef BUILD
	@echo "🔨 Forcing rebuild (keeping database)..."
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d --force-recreate
else
	@docker-compose up -d
endif
	@echo "✅ Services started"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "API Docs: http://localhost:8080/api/docs/index.html"
	@echo ""
	@echo "💡 Tip: Use 'make dev BUILD=1' to force rebuild"

dev-rebuild:
	@echo "🔨 Rebuilding everything from scratch (keeping database)..."
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d --force-recreate
	@echo "✅ Services rebuilt and started"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "API Docs: http://localhost:8080/api/docs/index.html"

dev-clean:
	@echo "🧹 Cleaning EVERYTHING including database..."
	@echo "⚠️  This will delete all data! Press Ctrl+C to cancel, Enter to continue..."
	@read confirmation
	@docker-compose down -v
	@docker volume prune -f
	@docker-compose build --no-cache
	@docker-compose up -d --force-recreate
	@echo "✅ Everything rebuilt from scratch"
	@echo ""
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "API Docs: http://localhost:8080/api/docs/index.html"

build:
	@echo "🔨 Building backend..."
	@cd backend && go build -o ../bin/lexia-api ./cmd/api
	@cd backend && go build -o ../bin/lexia-seed ./cmd/seed
	@echo "✅ Backend built"
	@echo ""
	@echo "🔨 Building frontend..."
	@cd frontend && npm install && npm run build
	@echo "✅ Frontend built"

test:
	@echo "🧪 Running backend tests..."
	@cd backend && go test -v ./...
	@echo ""
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf bin/
	@rm -rf backend/lexia-api backend/lexia-seed
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules/.vite
	@echo "✅ Clean complete"

# ============================================================================
# Quick Access URLs
# ============================================================================

urls:
	@echo "📍 Application URLs:"
	@echo ""
	@echo "Production (VM):"
	@echo "  Frontend:  http://$(VM_IP)"
	@echo "  API Docs:  http://$(VM_IP)/api/docs/index.html"
	@echo "  Health:    http://$(VM_IP)/health"
	@echo ""
	@echo "Demo Login:"
	@echo "  Email:     demo@synapse.app"
	@echo "  Password:  Demo1234"

# ============================================================================
# Firewall & Security
# ============================================================================

firewall:
	@echo "🔒 Configuring firewall on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'apt-get install -y ufw && ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable'
	@echo "✅ Firewall configured"
	@ssh $(SSH_USER)@$(VM_IP) 'ufw status'

ssl:
	@echo "🔐 Setting up SSL..."
	@echo "Enter your domain name:"
	@read -r domain; \
	ssh $(SSH_USER)@$(VM_IP) "certbot --nginx -d $$domain"

# ============================================================================
# Backups
# ============================================================================

backup-auto:
	@echo "⏰ Setting up automatic backups on VM..."
	@ssh $(SSH_USER)@$(VM_IP) 'bash -s' < scripts/setup-backup-cron.sh
	@echo "✅ Automatic backups configured (daily at 2 AM)"

# ============================================================================
# Troubleshooting
# ============================================================================

troubleshoot:
	@echo "🔍 Running diagnostics..."
	@echo ""
	@echo "1. Health Check:"
	@make health || echo "❌ Health check failed"
	@echo ""
	@echo "2. Container Status:"
	@ssh $(SSH_USER)@$(VM_IP) 'docker ps -a'
	@echo ""
	@echo "3. Recent Backend Logs:"
	@ssh $(SSH_USER)@$(VM_IP) 'docker logs --tail 50 lexia-backend'
	@echo ""
	@echo "4. Disk Space:"
	@ssh $(SSH_USER)@$(VM_IP) 'df -h'
	@echo ""
	@echo "5. Memory:"
	@ssh $(SSH_USER)@$(VM_IP) 'free -h'

# ============================================================================
# Testing
# ============================================================================

test-e2e:
	@echo "🧪 Running end-to-end tests..."
	@echo "Testing health endpoints..."
	@make health
	@echo ""
	@echo "Testing API endpoints..."
	@curl -s http://$(VM_IP)/api/docs/index.html > /dev/null && echo "✅ API docs accessible" || echo "❌ API docs failed"
	@echo ""
	@echo "Testing frontend..."
	@curl -s http://$(VM_IP) > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend failed"
