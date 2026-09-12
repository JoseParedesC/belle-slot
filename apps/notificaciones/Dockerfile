FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/notificaciones/package.json ./apps/notificaciones/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace=apps/notificaciones


FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/notificaciones/package.json ./apps/notificaciones/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/apps/notificaciones/dist ./apps/notificaciones/dist

WORKDIR /app/apps/notificaciones

EXPOSE 3001

CMD ["npm", "start"]