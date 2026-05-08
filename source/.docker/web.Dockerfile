# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
# Copy đúng file package.json từ thư mục web
COPY web/package*.json ./
RUN npm install
# Copy toàn bộ code web
COPY web/ ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY .docker/nginx-web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]