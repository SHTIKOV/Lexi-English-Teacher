.PHONY: help up down rebuild logs shell db-shell seed migrate status dev stop clean

COMPOSE = docker compose
COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml

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

clean:
	$(COMPOSE) down -v
	-$(COMPOSE_DEV) down -v
