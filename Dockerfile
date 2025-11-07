# Debug-friendly Dockerfile for your Next.js + server.ts + Prisma app
# Prints npm debug logs on failure so Coolify shows them in build output.

FROM node:20-alpine

WORKDIR /app

# Native libs commonly needed by Next/Prisma
RUN apk add --no-cache libc6-compat openssl

# ---------- Install deps (with verbose, log-dumping on failure) ----------
# Copy manifests first for better caching
COPY package.json package-lock.json* ./

# Use your lockfile; if install fails, dump /root/.npm/_logs/* into the build log
ENV NPM_CONFIG_LOGLEVEL=verbose
RUN npm ci \
  || (echo "===== npm ci failed – dumping npm debug logs =====" \
      && ls -lah /root/.npm/_logs || true \
      && cat /root/.npm/_logs/*-debug-0.log || true \
      && echo "===== end npm debug logs =====" \
      && exit 1)

# ---------- Copy source ----------
COPY . .

# ---------- Prisma (dump any error) ----------
RUN npx prisma generate \
  || (echo "===== prisma generate failed =====" && exit 1)

# ---------- Build Next.js (dump any npm logs if present) ----------
RUN npx next build \
  || (echo "===== next build failed – dumping npm logs if any =====" \
      && cat /root/.npm/_logs/*-debug-0.log || true \
      && echo "===== end build diagnostics =====" \
      && exit 1)

# Slim the image
RUN npm prune --omit=dev

# ---------- Runtime ----------
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Run migrations on boot (safe to keep || true in early stages), then start your TS server
# Your package.json has: "start": "NODE_ENV=production tsx server.ts"
CMD ["/bin/sh", "-c", "npx prisma migrate deploy || true; npm run start"]
