FROM node:25-alpine AS builder

WORKDIR /app

# Install monorepo root dependencies for hoisting
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/events/package.json ./packages/events/
COPY services/user-service/package.json ./services/user-service/

RUN npm install

# Copy source code across workspace
COPY packages/shared/ ./packages/shared/
COPY packages/events/ ./packages/events/
COPY services/user-service/ ./services/user-service/

# Build shared first
RUN cd packages/shared && npm run build
RUN cd packages/events && npm run build

# Build the specific service
RUN cd services/user-service && npm run build

# Production image
FROM node:25-alpine

WORKDIR /app

# Copy production artifacts
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/events/package.json ./packages/events/
COPY --from=builder /app/packages/events/dist ./packages/events/dist

COPY --from=builder /app/services/user-service/package.json ./services/user-service/
COPY --from=builder /app/services/user-service/dist ./services/user-service/dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "services/user-service/dist/server.js"]
