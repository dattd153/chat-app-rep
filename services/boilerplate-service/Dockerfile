FROM node:25-alpine AS builder

WORKDIR /app

# Install monorepo root dependencies for hoisting
COPY .npmrc ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/events/package.json ./packages/events/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config/package.json ./packages/config/
COPY services/boilerplate-service/package.json ./services/boilerplate-service/

RUN npm install

# Copy source code across workspace
COPY packages/shared/ ./packages/shared/
COPY packages/events/ ./packages/events/
COPY packages/logger/ ./packages/logger/
COPY packages/config/ ./packages/config/
COPY services/boilerplate-service/ ./services/boilerplate-service/

# Build shared first
RUN cd packages/shared && npm run build
RUN cd packages/events && npm run build
RUN cd packages/logger && npm run build
RUN cd packages/config && npm run build

# Build the specific service
RUN cd services/boilerplate-service && npm run build

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
COPY --from=builder /app/packages/logger/package.json ./packages/logger/
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/packages/config/package.json ./packages/config/
COPY --from=builder /app/packages/config/dist ./packages/config/dist

COPY --from=builder /app/services/boilerplate-service/package.json ./services/boilerplate-service/
COPY --from=builder /app/services/boilerplate-service/dist ./services/boilerplate-service/dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "services/boilerplate-service/dist/server.js"]
