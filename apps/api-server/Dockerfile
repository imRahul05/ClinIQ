# ─────────────────────────────────────────────────────────────────────────────
# ClinIQ API Server: Production Multi-Stage Dockerfile
# Optimized for minimal runtime overhead and zero TypeScript/DevDep bloat.
# ─────────────────────────────────────────────────────────────────────────────

# ── 1. Base stage with pnpm ──────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_MINIMUM_RELEASE_AGE=0
ENV PNPM_CONFIG_IGNORE_SCRIPTS=true
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

# ── 2. Dependencies stage ────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api-server/package.json ./apps/api-server/
COPY packages/api-spec/package.json ./packages/api-spec/
COPY packages/db/package.json ./packages/db/
COPY packages/fhir-core/package.json ./packages/fhir-core/
RUN pnpm install --frozen-lockfile

# ── 3. Builder stage ─────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm run build
RUN pnpm --filter @cliniq/api-server --legacy --prod deploy /app/pruned-api

# ── 4. Minimal Production Runner (Alpine) ────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Non-root user for security & HIPAA compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apijs

# Copy pruned production dependencies (~91MB) and compiled JS dist files
COPY --from=builder --chown=apijs:nodejs /app/pruned-api/node_modules ./node_modules
COPY --from=builder --chown=apijs:nodejs /app/apps/api-server/dist ./dist
COPY --from=builder --chown=apijs:nodejs /app/apps/api-server/package.json ./package.json
COPY --from=builder --chown=apijs:nodejs /app/packages/api-spec/dist ./packages/api-spec/dist
COPY --from=builder --chown=apijs:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=apijs:nodejs /app/packages/fhir-core/dist ./packages/fhir-core/dist

USER apijs
EXPOSE 4000

CMD ["node", "dist/index.js"]
