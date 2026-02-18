FROM oven/bun:1 AS builder
WORKDIR /app

# Copy workspace config files first (for dependency caching)
COPY package.json bun.lock* bunfig.toml ./

# Copy only the package.json files needed for workspace dep resolution
COPY api/package.json ./api/
COPY packages/ai/package.json ./packages/ai/

# Install all workspace dependencies (hoisted to root node_modules)
RUN bun install --frozen-lockfile

# Copy source code for packages the API depends on
COPY packages/ai/ ./packages/ai/
COPY api/ ./api/

# Build @businesspro/ai first (API depends on it)
RUN bun run build:ai

# Build the NestJS API
RUN cd api && bun run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the compiled API dist
COPY --from=builder /app/api/dist ./api/dist

# Copy root node_modules (hoisted — all deps live here including @businesspro/ai)
COPY --from=builder /app/node_modules ./node_modules

# Copy the built @businesspro/ai package so node can resolve it
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/ai/package.json ./packages/ai/package.json

# Copy api package.json (needed by node for module resolution)
COPY --from=builder /app/api/package.json ./api/package.json

EXPOSE 8000

CMD ["node", "api/dist/main"]
