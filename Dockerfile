FROM node:20-alpine

WORKDIR /app

# Native deps commonly needed by Next.js/Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy manifests first for better caching
COPY package.json package-lock.json* ./

# Install deps (uses your package-lock.json)
RUN npm ci

# Copy the rest of the app
COPY . .

# Generate Prisma client (no-op if not configured)
RUN npx prisma generate || true

# Build Next.js for SSR (avoid your package.json "next export")
RUN npx next build

# Drop dev deps to slim image (tsx is in dependencies, so it's safe)
RUN npm prune --omit=dev

# Runtime env
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Optional: run DB migrations on boot, then start your TS server
# Your start script: "start": "NODE_ENV=production tsx server.ts"
CMD ["/bin/sh", "-c", "npx prisma migrate deploy || true; npm run start"]
