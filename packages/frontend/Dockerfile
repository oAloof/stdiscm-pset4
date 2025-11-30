FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/frontend ./packages/frontend

# Install dependencies and build
RUN npm install
RUN npm run build -w @pset4/frontend

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
