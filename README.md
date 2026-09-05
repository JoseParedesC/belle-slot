# Manicure Reservas — Monorepo

Sistema de reservas web para un local de manicure.

## Servicios
- `apps/backend` — API principal (reservas, servicios, diseños, clientes)
- `apps/frontend` — Cliente web de reservas
- `apps/notificaciones` — Microservicio de recordatorios (email + WhatsApp)

## Levantar el proyecto
```bash
docker-compose up --build
```

Backend: http://localhost:3000
Frontend: http://localhost:5173
Notificaciones: http://localhost:3001

Ver `docs/AVANCES.md` para el estado de implementación.
