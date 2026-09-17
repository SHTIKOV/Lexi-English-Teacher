.PHONY: help up down rebuild logs shell db-shell seed migrate status dev stop clean remind deploy

COMPOSE = docker compose
COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml

# Production deploy (override if needed):
#   make deploy DEPLOY_HOST=shtikoff DEPLOY_PATH=/home/profipark/lexi.shtikoff.ru
DEPLOY_HOST ?= shtikoff
DEPLOY_PATH ?= /home/profipark/lexi.shtikoff.ru
DEPLOY_APP_PORT ?= 3011

help:
	@echo "Lexi — Docker commands"
	@echo ""
	@echo "  make up        Build and start production stack (app + db)"
	@echo "  make dev       Start development stack with hot reload"
	@echo "  make down      Stop and remove containers"
	@echo "  make stop      Stop containers without removing"
	@echo "  make rebuild   Rebuild images and restart"
	@echo "  make logs      Follow app+db logs"
	@echo "  make status    Show container status"
	@echo "  make shell     Shell into app container"
	@echo "  make db-shell  psql into Postgres"
	@echo "  make seed      Re-seed word blocks (wipes catalog)"
	@echo "  make migrate   Push Drizzle schema"
	@echo "  make remind    Send daily Max reminders now (force)"
	@echo "  make deploy    Rsync + rebuild on $(DEPLOY_HOST)"
	@echo "  make clean     Down + remove volumes (DATA LOSS)"

up:
	$(COMPOSE) up -d --build

dev:
	$(COMPOSE_DEV) up --build

down:
	$(COMPOSE) down --remove-orphans
	-$(COMPOSE_DEV) down --remove-orphans

stop:
	$(COMPOSE) stop

rebuild:
	$(COMPOSE) up -d --build --force-recreate

logs:
	$(COMPOSE) logs -f

status:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec app sh

db-shell:
	$(COMPOSE) exec db psql -U lexi -d lexi

seed:
	$(COMPOSE) exec app npx tsx server/db/seed.ts

migrate:
	$(COMPOSE) exec app npx drizzle-kit push --force

remind:
	@set -a; . ./.env; set +a; \
	curl -fsS -X POST "http://127.0.0.1:$${APP_PORT:-3000}/api/cron/daily-reminders?force=1" \
	  -H "Authorization: Bearer $${CRON_SECRET}"

deploy:
	DEPLOY_HOST=$(DEPLOY_HOST) DEPLOY_PATH=$(DEPLOY_PATH) DEPLOY_APP_PORT=$(DEPLOY_APP_PORT) \
		bash scripts/deploy.sh

clean:
	$(COMPOSE) down -v
	-$(COMPOSE_DEV) down -v
