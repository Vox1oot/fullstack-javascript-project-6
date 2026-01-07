.PHONY: 
	setup prepare install build start start-dev start-prod migrate-dev migrate-prod rollback reset lint

setup: 
	prepare install build

prepare:
	cp -n .env.example .env || true

install:
	npm ci

build:
	npm run build

start:
	npm run start

start-dev:
	@bash -c '\
		trap "kill 0" EXIT; \
		npm run dev:frontend & \
		npm run dev:backend & \
		wait \
	'

start-prod:
	npm run start


migrate-dev:
	npm run dev:migrate

migrate-prod:
	npm run migrate

rollback:
	npm run dev:rollback

reset:
	npm run dev:reset

lint:
	npm run lint:fix