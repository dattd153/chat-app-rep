FROM node:25-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm install

# Copy source codes
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared first, then web
RUN cd packages/shared && npm run build
RUN cd apps/web && npm run build

# Production server stage referencing Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output to Nginx hosting directory
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose generic port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
