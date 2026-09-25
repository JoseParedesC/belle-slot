# Etapa 1: Base & Build
FROM node:20-slim AS builder

# Instalar openssl necesario para Prisma engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias completas
RUN npm install

# Generar el cliente de Prisma para el entorno Linux actual
RUN npx prisma generate

# Copiar código fuente y configuración de compilación
COPY tsconfig.json ./
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Etapa 2: Runner de producción
FROM node:20-slim AS runner

# Instalar openssl en la etapa de ejecución
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copiar package.json y dependencias de producción
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main.js"]
