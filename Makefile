.PHONY: 
	prepare install build start-dev start-prod migrate-dev migrate-prod rollback reset lint

install:
	npm ci

build:
	npm run build

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

rollback-dev:
	npm run dev:rollback

rollback-prod:
	npm run rollback

lint:
	npm run lint:fix

test:
	npm test

test-coverage:
	npm run test:coverage