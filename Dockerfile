# ============================================
# Stage 1: Install dependencies (cached layer)
# ============================================
ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

# Copy only lockfile + package.json first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Reproducible install — keeps devDeps so `next build` works.
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# ============================================
# Stage 2: Build the Next.js app in standalone mode
# ============================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Reuse node_modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

ENV NODE_ENV=production

# Build-time public env vars — injected via docker build --build-arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 3: Minimal runtime image (standalone output)
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# `node` user already exists in the base image
USER node

# Copy standalone output (includes traced node_modules — only what is needed)
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Copy static assets (public folder + .next/static)
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

EXPOSE 3001

CMD ["node", "server.js"]
