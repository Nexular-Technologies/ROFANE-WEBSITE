FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Build the application
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build Next.js
RUN ./node_modules/.bin/prisma generate
RUN ./node_modules/.bin/next build

# Production image
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Blog image uploads are written here at runtime. This path must be backed by a
# PERSISTENT VOLUME in Coolify (mount a volume at /app/data), otherwise uploaded
# images are lost every time the container is redeployed or restarted.
ENV BLOG_UPLOAD_DIR=/app/data/uploads/blog

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN mkdir -p ./public/uploads/blog && chown -R nextjs:nodejs ./public
# Pre-create the upload dir owned by the runtime user so a freshly mounted named
# volume inherits the correct ownership and the app can write to it.
RUN mkdir -p /app/data/uploads/blog && chown -R nextjs:nodejs /app/data

# Standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
