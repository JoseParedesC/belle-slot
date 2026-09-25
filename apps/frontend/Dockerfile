FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace=apps/frontend


FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/frontend/package.json ./apps/frontend/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]