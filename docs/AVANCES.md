# Avances de Implementación — Sistema de Reservas Manicure

> Estado del monorepo al momento de este corte. Referencia: `plan-de-accion-por-fases.md`.

---

## ✅ Fases completadas

### Fase 0 — Preparación
- Estructura del monorepo creada (`apps/`, `packages/`, `docs/`)
- `docker-compose.yml` con PostgreSQL, backend, frontend y notificaciones
- `.env.example` en los 3 servicios
- `package.json` raíz con workspaces

### Fase 1 — Base de datos y backend núcleo
- Esquema completo en `apps/backend/prisma/schema.prisma` (Cliente, Servicio, Diseño, Empleada, Reserva, Notificación, ConfiguracionNegocio, PagoDeposito)
- Script de datos semilla (`prisma/seed.ts`) con un servicio y 3 diseños de ejemplo
- CRUD de Servicios y Diseños (`GET/POST /api/servicios`, `GET /api/servicios/:id/disenos`)
- Endpoint de Clientes con función `buscarOCrearCliente` (evita duplicados por teléfono)
- Endpoint de Configuración (`GET/PATCH /api/configuracion`) — incluye el texto del banner de precio

### Fase 2 — Lógica de reservas
- `disponibilidad.service.ts`: calcula bloques libres según horario del negocio, duración del servicio y reservas ya existentes (evita solapamientos)
- `reserva.service.ts`: creación de reserva con revalidación de disponibilidad en servidor, cálculo de precio final (`precio_base + incremento_diseno`), cancelación, y cambio de estado (incluyendo el incremento de `cantidad_inasistencias` al marcar `no_asistio`)
- Endpoints públicos: `GET /api/disponibilidad`, `POST /api/reservas`, `GET /api/reservas/:id`, `PATCH /api/reservas/:id/cancelar`
- Endpoints de administración: `GET /api/admin/reservas`, `PATCH /api/admin/reservas/:id/estado`, `GET /api/admin/reportes/ocupacion`
- Middleware de autenticación JWT simple para rutas `/api/admin/*`

### Fase 3 — Frontend: flujo de reserva del cliente
- Componentes: `SelectorServicio`, `SelectorDiseno`, `BannerAvisoPrecio`, `Calendario` (con consulta real de disponibilidad), `ResumenReserva`
- Página `Reservar.tsx` que orquesta el flujo completo: servicio → diseño → banner → fecha/hora → datos del cliente → confirmación
- El banner se muestra automáticamente al elegir servicio + diseño, usando el texto configurado en el backend
- Cliente API (`services/api.ts`) conectado a los endpoints reales del backend

### Fase 4 — Microservicio de notificaciones (email)
- Endpoint `POST /send-reminder`
- Proveedor de email vía SendGrid (`channels/email.provider.ts`) — **modo simulado activo si no se configura `EMAIL_PROVIDER_API_KEY`** (loguea el mensaje en consola en vez de enviarlo, para poder probar sin credenciales)
- Plantillas de texto para confirmación y recordatorios (`templates/mensajes.ts`)
- El backend dispara automáticamente la notificación de confirmación al crear una reserva

### Fase 5 — WhatsApp + cron de recordatorios
- Proveedor de WhatsApp vía Meta Cloud API (`channels/whatsapp.provider.ts`) — **también en modo simulado si no hay credenciales configuradas**
- `notificacion.service.ts` decide el canal (`email`, `whatsapp` o `ambos`) según los datos del cliente
- Cron job (`jobs/recordatorios.cron.ts`) que corre cada 15 minutos, revisa reservas próximas a 24h y 2h, dispara el recordatorio correspondiente y marca los flags `recordatorio_24h_enviado` / `recordatorio_2h_enviado` para evitar reenvíos duplicados

### Fase 6 — Panel de administración
- Endpoint de login (`POST /api/auth/login`) con usuario/contraseña fijos por variables de entorno (`ADMIN_USER`, `ADMIN_PASSWORD`), emite el JWT que ya validaba el middleware
- Frontend: página `Login.tsx` (guarda el token en `localStorage`) y `Calendario.tsx` con tabla de reservas del día, filtro por fecha, y botones para marcar `completada` / `no_asistio`
- Routing agregado con `react-router-dom` (`/`, `/admin/login`, `/admin/calendario`)
- Reporte de ocupación ya expuesto en el backend (`GET /api/admin/reportes/ocupacion`); **falta su vista en el frontend** (ver pendientes)

### Fase 7 — Pulido (parcial)
- Validación de `POST /api/reservas` con `zod` (`reserva.schema.ts`) — valida formato de fecha, hora, UUIDs y datos del cliente antes de procesar
- Persistencia de cada envío de notificación en la tabla `Notificacion` (`estado_envio`, `canal`, `tipo`, `fecha_envio`), ya no se pierde el registro tras la respuesta del microservicio

---

## 🚧 Pendiente por implementar

### Fase 6 — Panel de administración
- Vista de reporte de ocupación en el frontend (el endpoint ya existe, falta la pantalla)
- El login actual es un único usuario fijo por variables de entorno — sirve para un solo local, pero no escala a múltiples roles/usuarios sin una tabla de usuarios

### Fase 7 — Pulido y cierre del MVP
- Validación con `zod` aplicada solo a creación de reservas; falta extenderla a los demás endpoints (servicios, diseños, configuración)
- Manejo de errores sigue siendo genérico en varios controladores
- Pruebas automatizadas (la carpeta `apps/backend/tests` está creada pero vacía)

### Fase 8 — Futuro (post-MVP)
- No iniciado: integración bancaria para depósito/seña, reglas automáticas de depósito obligatorio para clientes reincidentes, migración de la comunicación backend↔notificaciones a una cola de mensajes

---

## Notas técnicas importantes para continuar

1. **Antes de correr el backend:** ejecutar `npx prisma migrate dev` dentro de `apps/backend` para crear las tablas, y luego `npx ts-node prisma/seed.ts` para poblar datos base.
2. **Credenciales de admin:** definir `ADMIN_USER` y `ADMIN_PASSWORD` en `apps/backend/.env` (hay valores de ejemplo en `.env.example`); con eso ya se puede hacer login desde `/admin/login` en el frontend.
3. **Notificaciones en modo simulado:** mientras no se configuren `EMAIL_PROVIDER_API_KEY` y `WHATSAPP_PROVIDER_API_KEY` en `apps/notificaciones/.env`, los envíos solo se imprimen en consola — útil para probar el flujo completo sin gastar créditos de los proveedores.
4. **`npm install` pendiente:** el zip no incluye `node_modules` ni `package-lock.json`; hay que instalar dependencias en cada servicio (`apps/backend`, `apps/frontend`, `apps/notificaciones`) antes de levantar el proyecto.
