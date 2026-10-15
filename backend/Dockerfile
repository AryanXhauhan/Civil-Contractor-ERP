FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install openssl runtime for Prisma query engine
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
