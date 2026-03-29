# Microservice Chat Application Monorepo

Welcome to the chat system monorepo. This repository follows a scalable, production-ready microservice architecture pattern.

## Monorepo Layout

- `apps/`: Frontend applications (e.g., `web` built with React, `mobile` with React Native).
- `services/`: Backend microservices (Node.js/TypeScript). Each service implements Clean Architecture paradigms (`auth-service`, `chat-service`, `message-service`, etc.).
- `packages/`: Shared packages containing code used across multiple services and apps (`shared`, `events`, `logger`).
- `infra/`: Infrastructure files, Kubernetes manifests, and Docker Compose scripts for Redis, Kafka, Nginx, and databases.

## Development

We use `npm workspaces` for managing internal dependencies.

Install dependencies across the whole repository:
```bash
npm install
```

Start the infrastructure dependencies locally (MongoDB, Redis, Kafka):
```bash
npm start
```
