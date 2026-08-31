# ─────────────────────────────────────────────────────────────────────────────
# ClinIQ Web: Production Multi-Stage Standalone Dockerfile
# Optimized for minimum image size (<150MB) and zero dev-dependency overhead.
# ─────────────────────────────────────────────────────────────────────────────

# ── 1. Base stage with pnpm ──────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

# ── 2. Dependencies stage ────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/fhir-core/package.json ./packages/fhir-core/
COPY packages/api-spec/package.json ./packages/api-spec/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

# ── 3. Builder stage ─────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter @cliniq/web run build

# ── 4. Minimal Production Runner (Alpine) ────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user for enterprise container security & HIPAA compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what Next.js standalone tracing emitted (Self-Contained ~45MB)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Prepare public directory
RUN mkdir -p apps/web/public && chown -R nextjs:nodejs apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
