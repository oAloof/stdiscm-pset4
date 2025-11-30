FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/proto ./packages/proto
COPY packages/auth-service ./packages/auth-service

# Install dependencies
RUN npm install

# Build shared-types and auth-service
RUN npm run build -w @pset4/shared-types
RUN npm run build -w @pset4/auth-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/packages/auth-service/dist ./dist
COPY --from=builder /app/packages/auth-service/package*.json ./
COPY --from=builder /app/packages/proto /app/packages/proto
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 50051

CMD ["node", "dist/index.js"]
