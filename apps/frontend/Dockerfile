FROM node:20-slim AS builder

WORKDIR /app

COPY package.json ./

COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN npm install

COPY . .

RUN npm run build --workspace=apps/frontend


FROM node:20-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/apps/frontend/dist ./dist

EXPOSE 5173

CMD ["sh", "-c", "serve -s dist -l ${PORT:-5173}"]