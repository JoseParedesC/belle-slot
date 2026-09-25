# Plan de Acción por Fases — Implementación del Monorepo

> Basado en la especificación técnica del sistema de reservas para el local de manicure.

---

## Fase 0 — Preparación

**Objetivo:** dejar el entorno listo antes de escribir lógica de negocio.

- Crear el monorepo con la estructura de carpetas definida (`apps/`, `packages/`, `docs/`)
- Configurar el workspace (npm/pnpm workspaces)
- Crear `docker-compose.yml` base con PostgreSQL
- Definir `.env.example` de los 3 servicios (backend, frontend, notificaciones)

**Entregable:** repo navegable, base de datos corriendo, sin lógica todavía.

---

## Fase 1 — Base de datos y backend núcleo

**Objetivo:** tener el backend sirviendo datos maestros reales.

- Ejecutar el script SQL del modelo de datos (o migraciones con Prisma/TypeORM)
- CRUD de `Servicio`, `Diseño`, `Cliente`
- Implementar `configuracion_negocio` (horarios, texto del banner)

**Entregable:** `GET /api/servicios` y `GET /api/servicios/:id/disenos` responden con datos reales.

---

## Fase 2 — Lógica de reservas (núcleo del sistema)

**Objetivo:** que el sistema pueda crear reservas de forma consistente.

- Cálculo de disponibilidad (`GET /api/disponibilidad`) — bloqueo de horarios según duración del servicio
- Creación de reserva (`POST /api/reservas`) con cálculo de precio final
- Cancelación y consulta de reserva (`GET/PATCH /api/reservas/:id`)
- Pruebas manuales de solapamiento de horarios (caso crítico)

**Entregable:** flujo completo de reservas funcionando vía API, sin frontend todavía.

---

## Fase 3 — Frontend: flujo de reserva del cliente

**Objetivo:** que un cliente real pueda reservar por su cuenta.

- Calendario de selección de fecha (consumiendo `/api/disponibilidad`)
- Selector de servicio y de diseño
- Banner de aviso de precio variable
- Pantalla de resumen y confirmación

**Entregable:** flujo de reserva completo funcionando en el navegador.

---

## Fase 4 — Microservicio de notificaciones (email primero)

**Objetivo:** confirmar reservas automáticamente por correo.

- Endpoint `POST /send-reminder`
- Integración con proveedor de email (SendGrid/SES/Resend)
- Conexión backend → notificaciones al crear una reserva

**Entregable:** el cliente recibe un correo de confirmación automático.

---

## Fase 5 — WhatsApp + cron de recordatorios

**Objetivo:** activar la estrategia principal contra el no-show.

- Integración con WhatsApp Business API y plantillas pre-aprobadas
- Cron en el backend: revisa reservas próximas (24h y 2-3h) y dispara envíos
- Actualización de flags `recordatorio_24h_enviado` / `recordatorio_2h_enviado`

**Entregable:** recordatorios automáticos funcionando de punta a punta.

---

## Fase 6 — Panel de administración

**Objetivo:** que el negocio pueda operar el día a día sin tocar la base de datos.

- Autenticación simple (JWT)
- Vista de calendario general de reservas
- Cambio manual de estado (`completada`, `no_asistio`) — alimenta `cantidad_inasistencias`
- Reporte básico de ocupación

**Entregable:** panel funcional para gestión diaria.

---

## Fase 7 — Pulido y cierre del MVP

**Objetivo:** dejar el sistema listo para uso real.

- Manejo de errores y validaciones en todos los endpoints
- Pruebas end-to-end (reserva → notificación → administración)
- Documentación final por servicio (README)

**Entregable:** MVP funcional listo para producción.

---

## Fase 8 — Futuro (post-MVP)

**Objetivo:** evolucionar el sistema una vez validado el MVP.

- Integración bancaria para cobro de depósito/seña
- Reglas automáticas de depósito obligatorio para clientes reincidentes
- Escalar comunicación backend ↔ notificaciones a cola de mensajes si crece el volumen

---

**Nota:** las Fases 1 y 2 son las más críticas — el resto del sistema depende de que la lógica de disponibilidad y precio esté bien resuelta. Conviene no saltarse las pruebas ahí antes de avanzar al frontend.
