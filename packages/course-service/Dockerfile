FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/proto ./packages/proto
COPY packages/course-service ./packages/course-service

RUN npm install
RUN npm run build -w @pset4/shared-types
RUN npm run build -w @pset4/course-service

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/packages/course-service/dist ./dist
COPY --from=builder /app/packages/course-service/package*.json ./
COPY --from=builder /app/packages/proto /app/packages/proto
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types

ENV NODE_ENV=production

EXPOSE 50052

CMD ["node", "dist/index.js"]
