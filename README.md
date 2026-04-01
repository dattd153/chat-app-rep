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

## Build

### Shared Packages

Các shared packages phải được build **trước** các services vì services phụ thuộc vào chúng.

Build tất cả packages cùng lúc:
```bash
npm run build:packages
```

Hoặc build từng package riêng lẻ:
```bash
# Shared utilities & types
npm run build --workspace=packages/shared

# Logger (winston)
npm run build --workspace=packages/logger

# Config & env validation
npm run build --workspace=packages/config

# Kafka event definitions
npm run build --workspace=packages/events
```

### Backend Services

Build từng service (TypeScript → `dist/`):
```bash
# API Gateway
npm run build --workspace=services/gateway

# Auth Service
npm run build --workspace=services/auth-service

# User Service
npm run build --workspace=services/user-service

# Chat Service
npm run build --workspace=services/chat-service

# Message Service
npm run build --workspace=services/message-service

# WebSocket Service
npm run build --workspace=services/websocket-service

# Notification Service
npm run build --workspace=services/notification-service
```

### Frontend

```bash
# Web App (React + Vite)
npm run build --workspace=apps/web
```

### Build toàn bộ (đúng thứ tự)

```bash
# 1. Packages trước
npm run build:packages

# 2. Sau đó build tất cả services & apps
npm run build --workspaces --if-present
```

### Chạy sau khi build

Mỗi service sau khi build có thể khởi động bằng:
```bash
node services/<tên-service>/dist/server.js
```

Ví dụ:
```bash
node services/auth-service/dist/server.js
node services/gateway/dist/server.js
```

## Docker

> **Lưu ý:** Tất cả lệnh `docker build` phải chạy từ **thư mục gốc của monorepo** (`chat-app-repo/`) vì các Dockerfile dùng toàn bộ monorepo làm build context để link shared packages.

### Build từng image riêng lẻ

```bash
# API Gateway
docker build -f services/gateway/Dockerfile -t chat-app/gateway .

# Auth Service
docker build -f services/auth-service/Dockerfile -t chat-app/auth-service .

# User Service
docker build -f services/user-service/Dockerfile -t chat-app/user-service .

# Chat Service
docker build -f services/chat-service/Dockerfile -t chat-app/chat-service .

# Message Service
docker build -f services/message-service/Dockerfile -t chat-app/message-service .

# WebSocket Service
docker build -f services/websocket-service/Dockerfile -t chat-app/websocket-service .

# Notification Service
docker build -f services/notification-service/Dockerfile -t chat-app/notification-service .

# Web App (React + Nginx)
docker build -f apps/web/Dockerfile -t chat-app/web .
```

### Docker Compose

> Dùng lệnh `docker compose` (có trong Docker Desktop / Docker Engine 20.10+), thay thế cho `docker-compose` (CLI cũ đã deprecated).

Build và khởi động toàn bộ hệ thống (infra + services + web):
```bash
docker compose up --build
```

Build và khởi động ở chế độ nền:
```bash
docker compose up --build -d
```

Chỉ build images, không khởi động:
```bash
# Build tất cả services
docker compose build

# Build song song (nhanh hơn)
docker compose build --parallel

# Build một service cụ thể
docker compose build gateway
docker compose build auth-service
docker compose build web

# Build không dùng cache (clean build)
docker compose build --no-cache

# Kết hợp: build song song, không cache, một service cụ thể
docker compose build --no-cache --parallel auth-service
```

Khởi động hệ thống đã build sẵn (không build lại):
```bash
docker compose up -d
```

Dừng toàn bộ hệ thống:
```bash
docker compose down
```

Dừng và xóa toàn bộ volumes (reset data):
```bash
docker compose down -v
```

Xem logs của một service:
```bash
docker compose logs -f gateway
docker compose logs -f auth-service
```

### Port mapping

| Service              | Host Port | Container Port |
|----------------------|-----------|----------------|
| Web App (Nginx)      | 8080      | 80             |
| API Gateway          | 3000      | 3000           |
| Auth Service         | 3001      | 3000           |
| User Service         | 3002      | 3000           |
| Chat Service         | 3003      | 3000           |
| Message Service      | 3004      | 3000           |
| WebSocket Service    | 3005      | 3000           |
| Notification Service | 3006      | 3000           |
| MongoDB              | 27017     | 27017          |
| Redis                | 6379      | 6379           |
| Kafka                | 9092      | 9092           |
| Zookeeper            | 2181      | 2181           |


## Kubernetes (K8s)

Manifests nằm ở [infra/k8s/](infra/k8s/). Cấu trúc:

```
infra/k8s/
├── 00-namespace.yaml       # Namespace: chat-app
├── 01-secrets.yaml         # JWT, Mongo URIs, Redis, Kafka, CORS origins
├── 02-mongo.yaml           # MongoDB StatefulSet (single-node Replica Set)
├── 03-redis.yaml           # Redis Deployment
├── 04-zookeeper.yaml       # Zookeeper Deployment
├── 05-kafka.yaml           # Kafka Deployment + Job tạo topics
├── 06-services.yaml        # Tất cả microservices + web (Deployment + Service)
└── 07-ingress.yaml         # Nginx Ingress (API / WebSocket / SPA)
```

### Yêu cầu

- `kubectl` đã kết nối vào cluster
- `helm` (để cài nginx-ingress)
- Container registry (Docker Hub, GCR, ECR, ...)
- Cluster có StorageClass hỗ trợ `ReadWriteOnce` (cho MongoDB PVC)

---

### Bước 1 — Build & push images lên registry

Thay `<REGISTRY>` bằng địa chỉ registry thực tế (ví dụ: `docker.io/myusername`).

```bash
# Build tất cả images
docker compose build

# Tag và push từng image
docker tag chat-app-repo-gateway           <REGISTRY>/chat-app/gateway:latest
docker tag chat-app-repo-auth-service      <REGISTRY>/chat-app/auth-service:latest
docker tag chat-app-repo-user-service      <REGISTRY>/chat-app/user-service:latest
docker tag chat-app-repo-chat-service      <REGISTRY>/chat-app/chat-service:latest
docker tag chat-app-repo-message-service   <REGISTRY>/chat-app/message-service:latest
docker tag chat-app-repo-websocket-service <REGISTRY>/chat-app/websocket-service:latest
docker tag chat-app-repo-notification-service <REGISTRY>/chat-app/notification-service:latest
docker tag chat-app-repo-web               <REGISTRY>/chat-app/web:latest

docker push <REGISTRY>/chat-app/gateway:latest
docker push <REGISTRY>/chat-app/auth-service:latest
docker push <REGISTRY>/chat-app/user-service:latest
docker push <REGISTRY>/chat-app/chat-service:latest
docker push <REGISTRY>/chat-app/message-service:latest
docker push <REGISTRY>/chat-app/websocket-service:latest
docker push <REGISTRY>/chat-app/notification-service:latest
docker push <REGISTRY>/chat-app/web:latest
```

---

### Bước 2 — Cài nginx-ingress controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
```

---

### Bước 3 — Cập nhật cấu hình trước khi deploy

Sửa 2 file trước khi apply:

**`infra/k8s/01-secrets.yaml`** — thay các giá trị placeholder:
```yaml
JWT_SECRET: "your-strong-secret"
ALLOWED_ORIGINS: "http://your-domain.com"
```

**`infra/k8s/06-services.yaml`** — thay `<REGISTRY>` bằng registry thực tế:
```bash
# Thay nhanh bằng sed
sed -i 's|<REGISTRY>|docker.io/myusername|g' infra/k8s/06-services.yaml
```

**`infra/k8s/07-ingress.yaml`** — thay domain:
```yaml
host: your-domain.com
```

---

### Bước 4 — Deploy theo thứ tự

```bash
# 1. Namespace
kubectl apply -f infra/k8s/00-namespace.yaml

# 2. Secrets
kubectl apply -f infra/k8s/01-secrets.yaml

# 3. Infrastructure (đúng thứ tự: Mongo → Redis → Zookeeper → Kafka)
kubectl apply -f infra/k8s/02-mongo.yaml
kubectl apply -f infra/k8s/03-redis.yaml
kubectl apply -f infra/k8s/04-zookeeper.yaml
kubectl apply -f infra/k8s/05-kafka.yaml

# Chờ infra sẵn sàng trước khi tiếp tục
kubectl wait --for=condition=ready pod -l app=mongo        -n chat-app --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis        -n chat-app --timeout=60s
kubectl wait --for=condition=ready pod -l app=zookeeper    -n chat-app --timeout=60s
kubectl wait --for=condition=ready pod -l app=kafka        -n chat-app --timeout=120s
kubectl wait --for=condition=complete job/kafka-init-topics -n chat-app --timeout=120s

# 4. Microservices + Web
kubectl apply -f infra/k8s/06-services.yaml

# 5. Ingress
kubectl apply -f infra/k8s/07-ingress.yaml
```

---

### Bước 5 — Kiểm tra

```bash
# Xem trạng thái tất cả pods
kubectl get pods -n chat-app

# Xem services & Ingress
kubectl get svc,ingress -n chat-app

# Log của từng service
kubectl logs -f deployment/gateway           -n chat-app
kubectl logs -f deployment/websocket-service -n chat-app
kubectl logs -f deployment/auth-service      -n chat-app

# Lấy IP của Ingress (dùng để trỏ DNS)
kubectl get ingress chat-app-ingress -n chat-app
```

---

### Cập nhật một service (rolling update)

```bash
# Build & push image mới
docker build -f services/auth-service/Dockerfile -t <REGISTRY>/chat-app/auth-service:v2 .
docker push <REGISTRY>/chat-app/auth-service:v2

# Rolling update — không downtime
kubectl set image deployment/auth-service auth-service=<REGISTRY>/chat-app/auth-service:v2 -n chat-app

# Theo dõi tiến trình
kubectl rollout status deployment/auth-service -n chat-app

# Rollback nếu lỗi
kubectl rollout undo deployment/auth-service -n chat-app
```

---

### Gỡ bỏ toàn bộ

```bash
kubectl delete namespace chat-app
```

---

### Kiến trúc traffic trong K8s

```
Internet
    │
    ▼
Nginx Ingress Controller
    ├── /socket.io/* ──► gateway Service :3000 ──► websocket-service (Redis Adapter)
    ├── /api/*       ──► gateway Service :3000 ──► auth/user/chat/message/notification services
    └── /*           ──► web Service :80        ──► React SPA (static files)
```

> **websocket-service** dùng `@socket.io/redis-adapter` — nhiều replica chia sẻ socket state qua Redis, không cần sticky session cứng.
