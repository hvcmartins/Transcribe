# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 – Install dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 – Build
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config.mjs has output: 'standalone' — produces a minimal server bundle
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 – Runtime (minimal image, ~150 MB)
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy static assets (CSS, JS, images)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder (icons, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# ─── Environment variables ────────────────────────────────────────────────────
# GROQ_API_KEY   — (optional) pre-configure Groq key so users don't need to
#                  enter it in the Settings panel.  Set this in Unraid's
#                  "Extra Parameters" or the template variable.
# PORT           — defaults to 3000; override if you remap the host port.
# ─────────────────────────────────────────────────────────────────────────────

CMD ["node", "server.js"]
