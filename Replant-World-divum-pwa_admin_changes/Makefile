TAG ?= $(shell git symbolic-ref --short -q HEAD | tr '/' '-' | tr '\' '-')-$(shell git describe --tags --long --always --abbrev=8 | tr '/' '-' | tr '\' '-')

ENV ?= dev

REGISTRY = registry.digitalocean.com/replant-world-prod

ifeq ($(ENV), prod)
VITE_API_URL = https://app.replantworld.io/api/
else
VITE_API_URL = https://dev.app.replantworld.ulam.pro/api/
endif

BACKEND_IMAGE_NAME = replant-backend
BACKEND_IMAGE_TAGGED = $(REGISTRY)/$(BACKEND_IMAGE_NAME):$(TAG)
UPLOAD_APP_IMAGE_NAME = replant-upload-app
UPLOAD_APP_IMAGE_TAGGED = $(REGISTRY)/$(UPLOAD_APP_IMAGE_NAME):$(TAG)
MARKETPLACE_APP_IMAGE_NAME = replant-marketplace-app
MARKETPLACE_APP_IMAGE_TAGGED = $(REGISTRY)/$(MARKETPLACE_APP_IMAGE_NAME):$(TAG)
ADMIN_APP_IMAGE_NAME = replant-admin-app
ADMIN_APP_IMAGE_TAGGED = $(REGISTRY)/$(ADMIN_APP_IMAGE_NAME):$(TAG)

.PHONY: help tag backend upload-app marketplace-app admin up up-backend down reset logs test-backend create-superuser lint-upload-app lint-marketplace-app push-backend push-upload-app push-marketplace-app push-admin deploy build release

help:			## Display commands list with explanation
	@grep '^\w.*:\s' Makefile | sed -e s'/: down/: /' -e 's/## //'

tag:			## Display current Docker tag
	@echo $(TAG)

backend:		## Build backend Docker image
	docker build backend \
		--tag $(BACKEND_IMAGE_NAME) \
		--tag $(BACKEND_IMAGE_TAGGED)

upload-app:		## Build upload app Docker image
	docker build upload-app \
		--tag $(UPLOAD_APP_IMAGE_NAME) \
		--tag $(UPLOAD_APP_IMAGE_TAGGED)

marketplace-app:		## Build marketplace app Docker image
	docker build marketplace-app \
		--build-arg VITE_API_URL=$(VITE_API_URL) \
		--tag $(MARKETPLACE_APP_IMAGE_NAME) \
		--tag $(MARKETPLACE_APP_IMAGE_TAGGED)

admin:			## Build admin app Docker image
	docker build Admin \
		--build-arg REACT_APP_API_BASE_URL=$(VITE_API_URL) \
		--tag $(ADMIN_APP_IMAGE_NAME) \
		--tag $(ADMIN_APP_IMAGE_TAGGED)

up: down			## Run local service containers
	@[ -f backend/.env ] || touch backend/.env
	docker compose  --profile frontend up --build --remove-orphans

up-backend: down			## Run local service containers (only backend)
	@[ -f backend/.env ] || touch backend/.env
	docker compose up --build --remove-orphans

down:			## Shut down service containers
	@[ -f backend/.env ] || touch backend/.env
	docker compose down --remove-orphans

reset: down			## Reset local database
	rm -rf .postgres-data/

logs:			## Print logs (last 100 and follow) from containers
	docker compose  logs --tail 100 -f

test-backend:		## Run tests in backend container
	docker run $(BACKEND_IMAGE_NAME) /bin/sh -c './lint.sh -c && pytest'

create-superuser:			## Create super user
	docker compose exec api python manage.py createsuperuser

lint-upload-app:		## Lint upload app in container
	docker run $(UPLOAD_APP_IMAGE_NAME) npm run lint

lint-marketplace-app:		## Lint marketplace app in container
	docker run $(MARKETPLACE_APP_IMAGE_NAME) npm run lint

admin-lint:		## Lint admin app in container
	docker run $(ADMIN_APP_IMAGE_NAME) npm run lint

push-backend:		## Push backend Docker image to registry
	docker push $(BACKEND_IMAGE_TAGGED)

push-upload-app:		## Push upload app Docker image to registry
	docker push $(UPLOAD_APP_IMAGE_TAGGED)

push-marketplace-app:		## Push marketplace app Docker image to registry
	docker push $(MARKETPLACE_APP_IMAGE_TAGGED)

push-admin:		## Push admin app Docker image to registry
	docker push $(ADMIN_APP_IMAGE_TAGGED)

deploy:			## Deploy project to Kubernetes cluster
	@echo >&2 "Deploying $(TAG) to $(ENV)"
	helm upgrade --install replant-$(ENV) ./helm/ \
		--namespace default \
		--set image.tag=$(TAG) \
		--values ./helm/envs/$(ENV)/values.yaml \
		--values ./helm/envs/$(ENV)/vars.yaml \
		--values ./helm/envs/$(ENV)/secrets.yaml

build: backend upload-app marketplace-app admin	## Build project

release: push-backend push-upload-app push-marketplace-app push-admin deploy	## Push and deploy project
