FROM node:20-slim AS base
WORKDIR /app

# Copy everything needed for install
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Install all workspaces (lockfile expects all to exist)
RUN npm ci

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/
COPY tsconfig.base.json ./

# Build shared + server
RUN cd packages/shared && npx tsc
RUN cd apps/server && npx tsc

# Production
FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

RUN npm ci --omit=dev

COPY --from=base /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=base /app/packages/shared/package.json ./packages/shared/
COPY --from=base /app/apps/server/dist/ ./apps/server/dist/

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
