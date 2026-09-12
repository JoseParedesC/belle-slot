FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN npm ci

COPY . .

WORKDIR /app/apps/backend

RUN npx prisma generate
RUN npm run build


FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "start"]