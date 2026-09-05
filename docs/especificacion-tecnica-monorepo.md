# Especificación Técnica — Sistema de Reservas para Local de Manicure

> Documento de referencia para implementación. Contiene arquitectura, estructura de carpetas, stack tecnológico, modelo de datos y contratos de API necesarios para desarrollar el sistema completo.

---

## 1. Resumen del sistema

Aplicación web de reservas para un local de manicure, compuesta por 3 servicios independientes dentro de un monorepo:

1. **Frontend** — interfaz donde el cliente reserva su cita
2. **Backend** — API principal, lógica de negocio y base de datos
3. **Servicio de notificaciones** — microservicio que envía recordatorios por email y WhatsApp

**Funcionalidades clave del MVP:**
- Selección de fecha/hora disponible
- Selección de tipo de servicio
- Selección de diseño (afecta precio final) + banner informativo de que el precio puede incrementar
- Confirmación de reserva
- Recordatorios automáticos por email y WhatsApp (24h y 2-3h antes)
- Panel de administración básico para el negocio

**Fuera del MVP (preparado para fase futura):**
- Cobro de depósito/seña con integración bancaria
- Múltiples empleadas con horarios propios

---

## 2. Estructura del monorepo

```
manicure-reservas/
├── apps/
│   ├── frontend/                  # Cliente web (reservas)
│   ├── backend/                   # API principal + lógica de negocio
│   └── notificaciones/            # Microservicio de email + WhatsApp
├── packages/
│   ├── shared-types/              # Tipos/interfaces TypeScript compartidos
│   └── shared-config/             # Constantes y configuración compartida
├── docs/
│   └── modelo-de-datos.md
├── docker-compose.yml
├── package.json                   # Workspace root (si se usa npm/pnpm workspaces)
└── README.md
```

### 2.1 Estructura de `apps/backend/`

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── modules/
│   │   ├── clientes/
│   │   │   ├── cliente.controller.ts
│   │   │   ├── cliente.service.ts
│   │   │   ├── cliente.repository.ts
│   │   │   └── cliente.entity.ts
│   │   ├── servicios/
│   │   ├── disenos/
│   │   ├── reservas/
│   │   │   ├── reserva.controller.ts
│   │   │   ├── reserva.service.ts
│   │   │   ├── reserva.repository.ts
│   │   │   ├── reserva.entity.ts
│   │   │   └── disponibilidad.service.ts   # cálculo de horarios libres
│   │   ├── notificaciones/
│   │   │   └── notificaciones.client.ts    # llama al microservicio
│   │   └── configuracion/
│   ├── jobs/
│   │   └── recordatorios.cron.ts           # revisa reservas próximas
│   ├── middlewares/
│   ├── routes/
│   │   └── index.ts
│   └── main.ts
├── migrations/
├── tests/
├── package.json
└── .env.example
```

### 2.2 Estructura de `apps/notificaciones/`

```
notificaciones/
├── src/
│   ├── channels/
│   │   ├── email.provider.ts        # SendGrid / SES / Resend
│   │   └── whatsapp.provider.ts     # WhatsApp Business API / Twilio
│   ├── templates/
│   │   ├── confirmacion.template.ts
│   │   ├── recordatorio-24h.template.ts
│   │   └── recordatorio-2h.template.ts
│   ├── controllers/
│   │   └── notificacion.controller.ts   # POST /send-reminder
│   ├── services/
│   │   └── notificacion.service.ts       # decide canal, arma mensaje
│   └── main.ts
├── package.json
└── .env.example
```

### 2.3 Estructura de `apps/frontend/`

```
frontend/
├── src/
│   ├── components/
│   │   ├── calendario/
│   │   ├── selector-servicio/
│   │   ├── selector-diseno/
│   │   ├── banner-aviso-precio/
│   │   └── resumen-reserva/
│   ├── pages/
│   │   ├── Reservar.tsx
│   │   ├── ConfirmacionReserva.tsx
│   │   └── admin/
│   │       ├── Calendario.tsx
│   │       └── Clientes.tsx
│   ├── services/
│   │   └── api.ts                   # cliente HTTP hacia backend
│   ├── hooks/
│   ├── types/
│   └── main.tsx
├── public/
├── package.json
└── .env.example
```

---

## 3. Stack tecnológico recomendado

| Componente | Tecnología sugerida | Alternativa |
|---|---|---|
| Frontend | React + TypeScript + Vite | Next.js si se necesita SSR/SEO |
| Backend | Node.js + Express o NestJS + TypeScript | — |
| Base de datos | PostgreSQL | MySQL/MariaDB |
| ORM | Prisma o TypeORM | Drizzle |
| Microservicio notificaciones | Node.js + Express (liviano) | — |
| Proveedor email | SendGrid, Amazon SES o Resend | Mailgun |
| Proveedor WhatsApp | WhatsApp Business API (vía Twilio, 360dialog o Meta directo) | — |
| Comunicación backend ↔ notificaciones | REST (POST directo) en MVP | Cola de mensajes (RabbitMQ/SQS) en escalado futuro |
| Contenedores | Docker + docker-compose | — |
| Autenticación panel admin | JWT simple | — |

---

## 4. Modelo de datos (PostgreSQL)

```sql
CREATE TABLE cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  cantidad_inasistencias INT DEFAULT 0,
  notas_internas TEXT,
  fecha_registro TIMESTAMP DEFAULT now()
);

CREATE TABLE servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  duracion_minutos INT NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE diseno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  incremento_precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  servicio_id UUID REFERENCES servicio(id),
  imagen_referencia_url TEXT
);

CREATE TABLE empleada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  activo BOOLEAN DEFAULT true
);

CREATE TYPE estado_reserva AS ENUM (
  'pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio'
);

CREATE TABLE reserva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES cliente(id),
  servicio_id UUID NOT NULL REFERENCES servicio(id),
  diseno_id UUID REFERENCES diseno(id),
  empleada_id UUID REFERENCES empleada(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  precio_estimado DECIMAL(10,2) NOT NULL,
  estado estado_reserva DEFAULT 'pendiente',
  recordatorio_24h_enviado BOOLEAN DEFAULT false,
  recordatorio_2h_enviado BOOLEAN DEFAULT false,
  confirmada_por_cliente BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT now(),
  fecha_cancelacion TIMESTAMP,
  motivo_cancelacion TEXT
);

CREATE TYPE canal_notificacion AS ENUM ('email', 'whatsapp');
CREATE TYPE tipo_notificacion AS ENUM (
  'confirmacion_reserva', 'recordatorio_24h', 'recordatorio_2h', 'cancelacion'
);
CREATE TYPE estado_envio AS ENUM ('pendiente', 'enviado', 'fallido');

CREATE TABLE notificacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reserva(id),
  canal canal_notificacion NOT NULL,
  tipo tipo_notificacion NOT NULL,
  estado_envio estado_envio DEFAULT 'pendiente',
  fecha_envio TIMESTAMP,
  respuesta_cliente VARCHAR(50)
);

CREATE TABLE configuracion_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_apertura TIME NOT NULL,
  horario_cierre TIME NOT NULL,
  dias_atencion JSONB NOT NULL,
  duracion_bloque_minutos INT DEFAULT 30,
  horas_anticipacion_cancelacion INT DEFAULT 12,
  texto_banner_precio TEXT
);

-- Preparado para fase futura, no usado en MVP
CREATE TYPE estado_pago AS ENUM ('pendiente', 'pagado', 'reembolsado', 'perdido_por_inasistencia');

CREATE TABLE pago_deposito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reserva(id),
  monto_deposito DECIMAL(10,2) NOT NULL,
  estado estado_pago DEFAULT 'pendiente',
  proveedor_pago VARCHAR(100),
  referencia_transaccion VARCHAR(150)
);
```

---

## 5. Contratos de API (backend principal)

### 5.1 Reservas

```
GET    /api/servicios                     → lista de servicios activos
GET    /api/servicios/:id/disenos         → diseños disponibles para un servicio
GET    /api/disponibilidad?fecha=YYYY-MM-DD&servicio_id=...
       → horarios libres para esa fecha/servicio

POST   /api/reservas
Body: {
  cliente: { nombre, telefono, email },
  servicio_id, diseno_id (opcional),
  fecha, hora_inicio
}
Response: {
  id, precio_estimado, estado, hora_fin
}

GET    /api/reservas/:id
PATCH  /api/reservas/:id/cancelar
```

### 5.2 Administración

```
GET    /api/admin/reservas?fecha=YYYY-MM-DD
PATCH  /api/admin/reservas/:id/estado     Body: { estado: "completada" | "no_asistio" }
GET    /api/admin/clientes
GET    /api/admin/reportes/ocupacion
```

### 5.3 API del microservicio de notificaciones

```
POST /send-reminder
Body: {
  reserva_id,
  cliente: { nombre, telefono, email },
  canal: "email" | "whatsapp" | "ambos",
  tipo: "confirmacion_reserva" | "recordatorio_24h" | "recordatorio_2h",
  datos_cita: { fecha, hora, servicio }
}
Response: { estado_envio: "enviado" | "fallido" }
```

---

## 6. Lógica de negocio crítica a implementar

1. **Cálculo de disponibilidad:** al reservar, bloquear el rango `hora_inicio`–`hora_fin` según `duracion_minutos` del servicio, evitando solapamientos con otras reservas del mismo día/empleada.
2. **Cálculo de precio final:** `precio_estimado = servicio.precio_base + (diseno?.incremento_precio ?? 0)`.
3. **Banner de aviso:** el frontend debe mostrar el texto de `configuracion_negocio.texto_banner_precio` justo después de que el cliente elige el diseño, antes de confirmar.
4. **Job de recordatorios (cron):** ejecutar cada X minutos, buscar reservas con `fecha` a 24h o 2-3h de distancia y `recordatorio_24h_enviado`/`recordatorio_2h_enviado = false`; llamar al microservicio de notificaciones y marcar el flag como `true` tras envío exitoso.
5. **Actualización de inasistencias:** cuando el estado cambia a `no_asistio`, incrementar `cliente.cantidad_inasistencias` (para futura lógica de depósito obligatorio a reincidentes).

---

## 7. Variables de entorno esperadas

**Backend (`.env`):**
```
DATABASE_URL=
PORT=
NOTIFICACIONES_SERVICE_URL=
JWT_SECRET=
```

**Notificaciones (`.env`):**
```
PORT=
EMAIL_PROVIDER_API_KEY=
WHATSAPP_PROVIDER_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
```

**Frontend (`.env`):**
```
VITE_API_URL=
```

---

## 8. Orden sugerido de implementación

1. Modelo de datos + migraciones (backend)
2. CRUD de Servicios, Diseños, Clientes
3. Lógica de disponibilidad y creación de Reservas
4. Frontend: flujo de reserva (calendario → servicio → diseño → banner → confirmación)
5. Microservicio de notificaciones (email primero, luego WhatsApp)
6. Cron de recordatorios conectando backend ↔ notificaciones
7. Panel de administración básico
8. (Fase futura) Integración de depósito/pago bancario
