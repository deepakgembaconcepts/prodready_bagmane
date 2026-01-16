# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY services ./services
COPY config ./config
COPY data ./data
# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server.js"]
