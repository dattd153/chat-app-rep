FROM node:25-alpine AS builder

WORKDIR /app

# Install monorepo root dependencies for hoisting
COPY .npmrc ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/events/package.json ./packages/events/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config/package.json ./packages/config/
COPY apps/web/package.json ./apps/web/

RUN npm install

# Copy source codes
COPY packages/shared ./packages/shared
COPY packages/events ./packages/events
COPY packages/logger ./packages/logger
COPY packages/config ./packages/config
COPY apps/web ./apps/web

# Build shared first, then web
RUN cd packages/shared && npm run build
RUN cd packages/events && npm run build
RUN cd packages/logger && npm run build
RUN cd packages/config && npm run build
RUN cd apps/web && npm run build

# Production server stage referencing Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output to Nginx hosting directory
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose generic port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
