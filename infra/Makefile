.PHONY: build-frontend build-backend build \
       docker-frontend docker-backend docker \
       all run stop rebuild clean

# Build (compile/bundle) targets
build-frontend:
	cd ../frontend && npm install && npm run build

build-backend:
	cd ../backend && ./gradlew build

build: build-frontend build-backend

# Docker image targets
docker-frontend:
	docker compose build frontend

docker-backend:
	docker compose build backend

docker: docker-frontend docker-backend

# Build everything and create Docker images
all: build docker

# Run / stop containers
run:
	docker compose up -d

stop:
	docker compose down

# Rebuild images from scratch and start containers
rebuild:
	docker compose up -d --build

# Remove containers and images
clean:
	docker compose down --rmi local
