FROM node:20-slim AS base
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install all deps
RUN npm ci --workspace=packages/shared --workspace=apps/server --include-workspace-root

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/
COPY tsconfig.base.json ./

# Build shared + server
RUN npm -w packages/shared run build
RUN npm -w apps/server run build

# Production
FROM node:20-slim
WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/packages/shared/package.json ./packages/shared/
COPY --from=base /app/apps/server/package.json ./apps/server/

RUN npm ci --workspace=packages/shared --workspace=apps/server --include-workspace-root --omit=dev

COPY --from=base /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=base /app/packages/shared/package.json ./packages/shared/
COPY --from=base /app/apps/server/dist/ ./apps/server/dist/

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
