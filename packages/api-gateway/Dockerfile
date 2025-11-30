FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/proto ./packages/proto
COPY packages/api-gateway ./packages/api-gateway

RUN npm install
RUN npm run build -w @pset4/shared-types
RUN npm run build -w @pset4/api-gateway

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/packages/api-gateway/dist ./dist
COPY --from=builder /app/packages/api-gateway/package*.json ./
COPY --from=builder /app/packages/proto /app/packages/proto
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/index.js"]
