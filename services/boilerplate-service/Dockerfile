FROM node:25-alpine AS builder

WORKDIR /app

# Install monorepo root dependencies
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/events/package.json ./packages/events/
COPY services/boilerplate-service/package.json ./services/boilerplate-service/

RUN npm install

# Copy source code
COPY . .

# Build the shared packages first, then the service
RUN cd packages/shared && npm run build
RUN cd packages/events && npm run build
RUN cd services/boilerplate-service && npm run build

# Production image
FROM node:25-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/events/dist ./packages/events/dist
COPY --from=builder /app/packages/events/package.json ./packages/events/
COPY --from=builder /app/services/boilerplate-service/dist ./services/boilerplate-service/dist
COPY --from=builder /app/services/boilerplate-service/package.json ./services/boilerplate-service/

WORKDIR /app/services/boilerplate-service

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
