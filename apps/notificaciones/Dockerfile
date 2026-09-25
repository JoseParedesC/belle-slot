# Etapa 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copia los package files asumiendo contexto en /apps/notificaciones
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

# Copia el código fuente del microservicio
COPY src ./src

# Compila TypeScript
RUN npm run build

# Etapa 2: Runner de producción
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia dependencias y compilados
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
