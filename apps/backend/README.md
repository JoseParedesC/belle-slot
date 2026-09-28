# Belle Slot — Backend

API REST multi-empresa (multi-tenant) para gestionar reservas de salones de manicure y estética. Cada salón (*empresa*) tiene sus propios servicios, diseños, estilistas, clientes, horarios y reservas, todos aislados por un identificador único (`slug`).

## Contenido

1. [Funcionalidades](#funcionalidades)
2. [Stack y estructura](#stack-y-estructura)
3. [Puesta en marcha local](#puesta-en-marcha-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Base de datos: migraciones y seed](#base-de-datos-migraciones-y-seed)
6. [Multi-tenant: cómo se identifica el salón](#multi-tenant-cómo-se-identifica-el-salón)
7. [Autenticación](#autenticación)
8. [Disponibilidad de horarios](#disponibilidad-de-horarios)
9. [Configurar horarios, días y temporadas](#configurar-horarios-días-y-temporadas)
10. [Referencia de endpoints](#referencia-de-endpoints)
11. [Recordatorios y notificaciones](#recordatorios-y-notificaciones)
12. [Despliegue en Railway](#despliegue-en-railway)
13. [Solución de problemas](#solución-de-problemas)
14. [Limitaciones conocidas y seguridad](#limitaciones-conocidas-y-seguridad)

---

## Funcionalidades

- **Multi-empresa (SaaS):** varios salones en la misma instancia, aislados por `slug`. Incluye directorio público de salones y registro de nuevos salones.
- **Catálogo:** servicios (con duración y precio base) y diseños (con incremento de precio, opcionalmente ligados a un servicio).
- **Disponibilidad inteligente:** calcula las horas reservables según los días de atención, los turnos configurados (incluida la pausa de almuerzo), horarios por temporada, la duración del servicio y las citas ya reservadas. Devuelve **todas** las horas del día indicando cuáles están libres y cuáles bloqueadas.
- **Reservas:** creación con revalidación de disponibilidad en el servidor, cancelación, consulta por cliente y cambio de estado (`completada`, `no_asistio`). Las inasistencias se acumulan por cliente.
- **Panel de administración:** listado de reservas con filtros, gestión de estilistas autorizadas, edición de la configuración del salón y reporte de ocupación.
- **Autenticación:** login de administración (JWT) y acceso con Google para estilistas y clientas.
- **Recordatorios automáticos:** tarea programada que avisa 24 h y 2 h antes de la cita y registra cada envío.

---

## Stack y estructura

Node.js 20 · TypeScript · Express · Prisma (PostgreSQL) · Zod · JWT · node-cron

```
apps/backend
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── migrations/            # Migraciones versionadas (se aplican con migrate deploy)
│   └── seed.ts                # Datos iniciales (empresas, servicios, estilistas, usuarios)
├── src/
│   ├── main.ts                # Arranque de Express, CORS, rutas y cron
│   ├── routes/index.ts        # Montaje de routers (públicos y /admin)
│   ├── middlewares/
│   │   ├── tenant.middleware.ts   # Resuelve la empresa de cada petición
│   │   └── auth.middleware.ts     # Valida el JWT en rutas /admin
│   ├── modules/
│   │   ├── auth/              # Login, acceso con Google, gestión de estilistas
│   │   ├── saas/              # Directorio y registro de salones
│   │   ├── configuracion/     # Datos y horarios del salón
│   │   ├── servicios/  disenos/  clientes/
│   │   ├── reservas/          # Controlador, servicio, esquema Zod y disponibilidad
│   │   └── notificaciones/    # Cliente HTTP del microservicio de notificaciones
│   └── jobs/recordatorios.cron.ts
└── Dockerfile
```

---

## Puesta en marcha local

Requisitos: Node.js 20+ y una base PostgreSQL.

```bash
cd apps/backend
cp .env.example .env            # ajusta DATABASE_URL y los secretos
npm install
npx prisma generate
npx prisma migrate deploy       # crea las tablas (o `npm run prisma:migrate` en desarrollo)
npx prisma db seed              # carga los datos iniciales
npm run dev                     # http://localhost:3000
```

Scripts disponibles:

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con recarga (`ts-node-dev`). |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Ejecuta el build compilado (`node dist/main.js`). |
| `npm run prisma:generate` | Regenera el cliente de Prisma. |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo (`prisma migrate dev`). |

Comprobación rápida: `GET /health` responde `{"status":"ok"}`.

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión a PostgreSQL. |
| `PORT` | No | Puerto HTTP (por defecto `3000`; Railway lo inyecta). |
| `JWT_SECRET` | Sí en producción | Secreto para firmar los tokens. Si falta se usa `dev-secret`: **nunca lo dejes así en producción**. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Sí en producción | Credenciales del administrador general. Por defecto `admin` / `admin123`: **cámbialas**. |
| `NOTIFICACIONES_SERVICE_URL` | No | URL del microservicio que envía correos/WhatsApp (por defecto `http://localhost:3001`). |
| `TIMEZONE_NEGOCIO` | No | Zona horaria IANA usada para bloquear las horas que ya pasaron hoy (por defecto `America/Bogota`). El servidor corre en UTC, por eso se calcula explícitamente. |

---

## Base de datos: migraciones y seed

- Las migraciones viven en `prisma/migrations/` y se aplican con `npx prisma migrate deploy`. El `Dockerfile` ya lo ejecuta al arrancar el contenedor.
- **Cada cambio en `schema.prisma` necesita su migración** (`npx prisma migrate dev --name descripcion`) y esa carpeta debe subirse al repositorio. Si el schema va por delante de las migraciones, las tablas nuevas no existirán en producción (error `P2021`).
- El **seed** (`prisma/seed.ts`) es idempotente (usa `upsert`) y se ejecuta con `npx prisma db seed`. Requiere el paquete **`tsx`** en `devDependencies`:

  ```bash
  npm install -D tsx
  ```

  Crea dos salones de ejemplo (`dahood24` y `jc-nails`), sus servicios, diseños y estilistas, y estos usuarios: `superadmin@saas.local`, `admin@dahood24.local` y `admin@jcnails.local`. El salón `jc-nails` incluye un horario por temporada con pausa de almuerzo.

---

## Multi-tenant: cómo se identifica el salón

Todas las rutas (salvo `/api/saas/*` y `/health`) pasan por `resolverTenant`, que determina la empresa con este orden de prioridad:

1. Header `x-tenant-slug`
2. Parámetro de ruta `:slug` / `:empresaSlug`
3. Query `?empresa_slug=` o `?tenant=`
4. Valor por defecto: `belle-slot`

Si el slug no existe responde `404`; si la empresa está inactiva, `403`. Toda consulta de servicios, reservas, clientes, estilistas y configuración se filtra por la empresa resuelta.

```bash
curl -H "x-tenant-slug: jc-nails" http://localhost:3000/api/servicios
```

---

## Autenticación

Las rutas `/api/admin/*` exigen el header `Authorization: Bearer <token>`.

**Administrador** — `POST /api/auth/login`

```json
{ "usuario": "admin", "password": "admin123" }
```

Acepta las credenciales de `ADMIN_USER`/`ADMIN_PASSWORD` o el email de un registro de la tabla `Usuario` del salón. El token dura 12 h y devuelve `{ token, usuario }`.

**Google (estilistas y clientas)** — `POST /api/auth/google`

```json
{ "credential": "<JWT de Google>", "rol": "estilista" }
```

- `rol: "estilista"`: solo entra si el correo está pre-registrado y activo en el salón (lo gestiona el administrador en `/api/admin/estilistas`).
- `rol: "cliente"`: si no existe, la clienta se registra automáticamente.
- El token dura 24 h.

---

## Disponibilidad de horarios

La lógica está en `src/modules/reservas/disponibilidad.service.ts`, dividida en funciones reutilizables:

| Función | Tipo | Qué hace |
|---|---|---|
| `atiendeEnFecha(diasAtencion, fecha)` | pura | Indica si el salón atiende ese día de la semana (ignora tildes y mayúsculas). |
| `resolverTurnos(config, mes)` | pura | Devuelve los rangos horarios del mes. Prioridad: temporada estacional → `personalizacion.turnos` → pausa de almuerzo → horario continuo. |
| `generarHorasDeInicio(turnos, duracion, bloque)` | pura | Genera cada hora de inicio posible. Una cita solo es válida si **termina dentro del mismo turno**, por eso nunca se ofrecen horas que crucen el almuerzo. |
| `marcarBloqueos(horas, duracion, ocupados, minutosMinimos?)` | pura | Marca cada hora como disponible, `ocupado` (se solapa con una cita) o `pasada` (ya transcurrió hoy). |
| `calcularSlotsDelDia(fecha, servicioId, empresaId?)` | BD | Función principal: devuelve todas las horas del día con su estado. |
| `calcularDisponibilidad(fecha, servicioId, empresaId?)` | BD | Solo las horas libres (`string[]`). La usa `crearReserva` para revalidar en el servidor. |

Reglas de cálculo:

- La duración del servicio (`duracionMinutos`) determina qué horas caben y cuánto tiempo bloquea una cita.
- El intervalo entre horas ofrecidas es `duracionBloqueMinutos` de la empresa (30 por defecto).
- Solo bloquean las reservas en estado `pendiente` o `confirmada`; las canceladas liberan el horario.
- Un día en que el salón no atiende devuelve una lista vacía.
- Hoy se bloquean además las horas anteriores a la actual, y una fecha pasada queda bloqueada por completo.
- Una cita bloquea el horario para todo el salón (no hay agenda por estilista).

### `GET /api/disponibilidad?fecha=YYYY-MM-DD&servicio_id=<uuid>`

```bash
curl -H "x-tenant-slug: jc-nails" \
  "http://localhost:3000/api/disponibilidad?fecha=2026-10-05&servicio_id=<uuid>"
```

```json
{
  "fecha": "2026-10-05",
  "servicio_id": "…",
  "horarios": [
    { "hora": "09:00", "disponible": true },
    { "hora": "10:30", "disponible": false, "motivo": "ocupado" },
    { "hora": "13:00", "disponible": true }
  ],
  "horarios_disponibles": ["09:00", "13:00"]
}
```

- `horarios`: todas las horas dentro de los rangos configurados, con su estado. Úsalo para pintar botones y deshabilitar los bloqueados. `motivo` es `ocupado` o `pasada`.
- `horarios_disponibles`: solo las libres (compatibilidad con clientes anteriores).

---

## Configurar horarios, días y temporadas

Se configura por empresa con `PATCH /api/admin/configuracion` (requiere token). Los campos que definen la disponibilidad:

| Campo | Ejemplo | Efecto |
|---|---|---|
| `diasAtencion` | `["Lunes","Martes","Sábado"]` | Días que atiende. Los demás se muestran cerrados. |
| `horarioApertura` / `horarioCierre` | `"09:00"` / `"18:00"` | Horario continuo por defecto. |
| `duracionBloqueMinutos` | `30` | Intervalo entre horas de inicio ofrecidas. |
| `horasAnticipacionCancelacion` | `12` | Horas mínimas de anticipación para cancelar. |
| `personalizacion` | ver abajo | JSON libre con turnos, temporadas y pausa de almuerzo. |

### Pausa de almuerzo y temporadas

Los turnos son rangos independientes; el espacio entre ellos (el almuerzo) nunca genera horas reservables. Dentro de `personalizacion`:

```json
{
  "horarioEstacional": {
    "activo": true,
    "temporadas": [
      {
        "nombre": "feb-oct",
        "meses": [2, 3, 4, 5, 6, 7, 8, 9, 10],
        "turnos": [
          { "inicio": "09:00", "fin": "12:00" },
          { "inicio": "13:00", "fin": "19:00" }
        ]
      },
      {
        "nombre": "nov-dic",
        "meses": [11, 12],
        "turnos": [{ "inicio": "09:00", "fin": "19:00" }]
      }
    ]
  }
}
```

Alternativas más simples cuando no se usan temporadas: `personalizacion.turnos` (lista de turnos fija) o `personalizacion.pausaAlmuerzo` (`{ "inicio": "12:00", "fin": "13:00" }`, que parte el horario general en dos turnos).

> **Importante:** `PATCH` reemplaza el campo `personalizacion` completo, no lo mezcla. Envía siempre el objeto entero (por ejemplo `{ ...personalizacionActual, horarioEstacional: {...} }`) para no borrar otras claves como `instagram` o `textoHorario`.

`GET /api/configuracion` devuelve los datos actuales del salón (nombre, contacto, horarios, colores y `personalizacion`).

---

## Referencia de endpoints

Prefijo `/api`. Salvo `/saas/*`, todas necesitan resolver el salón (ver [Multi-tenant](#multi-tenant-cómo-se-identifica-el-salón)).

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/saas/empresas` | Directorio de salones activos. |
| GET | `/saas/empresas/:slug` | Perfil público de un salón. |
| POST | `/saas/empresas` | Registro de un nuevo salón (`nombre` obligatorio; genera `slug` único, responde `409` si ya existe). |
| GET | `/servicios` | Servicios activos del salón, ordenados por precio. |
| GET | `/servicios/:id/disenos` | Diseños de un servicio (más los genéricos). |
| GET | `/disenos` | Lista de diseños. |
| GET | `/configuracion` | Datos y horarios del salón. |
| GET | `/disponibilidad` | Horas del día con su estado (ver arriba). |
| POST | `/reservas` | Crea una reserva. |
| GET | `/reservas/:id` | Detalle de una reserva. |
| GET | `/reservas/cliente/mis-reservas?email=` o `?telefono=` | Reservas de una clienta. |
| PATCH | `/reservas/:id/cancelar` | Cancela una reserva (`{ "motivo": "…" }` opcional). |
| POST | `/auth/login` · `/auth/google` | Autenticación. |
| GET | `/auth/estilistas` | Estilistas activas (para el selector de citas). |

### Crear una reserva — `POST /api/reservas`

```json
{
  "cliente": { "nombre": "Ana Pérez", "telefono": "3001234567", "email": "ana@correo.com" },
  "servicio_id": "<uuid>",
  "diseno_id": "<uuid, opcional>",
  "fecha": "2026-10-05",
  "hora_inicio": "09:00"
}
```

El servidor revalida la disponibilidad antes de guardar: si la hora ya no está libre responde `400` con `"El horario seleccionado ya no está disponible"`. Calcula `horaFin` con la duración del servicio, el `precioEstimado` (precio base + incremento del diseño), crea la reserva en estado `pendiente`, registra o reutiliza a la clienta y dispara la notificación de confirmación sin bloquear la respuesta.

### Administración (`Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/reservas` | Reservas con filtros: `fecha`, `fecha_inicio`, `fecha_fin`, `cliente`, `servicio_id`, `empleada_id`, `estado`. |
| PATCH | `/admin/reservas/:id/estado` | Cambia a `completada` o `no_asistio` (esta última suma una inasistencia a la clienta). |
| GET | `/admin/reportes/ocupacion` | Total de reservas y desglose por estado. |
| GET | `/admin/clientes` · `/admin/clientes/:id` | Clientas del salón. |
| GET | `/admin/estilistas` | Lista completa de estilistas con su estado. |
| POST | `/admin/estilistas` | Autoriza una estilista (`nombre` y `email` obligatorios; `409` si el correo ya existe). |
| PATCH | `/admin/estilistas/:id/estado` | Activa o revoca el acceso (`{ "activo": true }`). |
| GET · PATCH | `/admin/configuracion` | Lee o actualiza la configuración del salón. |

Estados de una reserva: `pendiente`, `confirmada`, `completada`, `cancelada`, `no_asistio`.

---

## Recordatorios y notificaciones

`src/jobs/recordatorios.cron.ts` corre **cada 15 minutos** y busca reservas `pendiente`/`confirmada` que estén a ~24 h y ~2 h de comenzar y cuyo recordatorio aún no se haya enviado. Por cada una llama al microservicio de notificaciones (`POST {NOTIFICACIONES_SERVICE_URL}/send-reminder`), marca el recordatorio como enviado y guarda el intento (canal, tipo, estado) en la tabla `Notificacion`. Si el envío falla queda registrado como `fallido` y no interrumpe el flujo de la reserva.

---

## Despliegue en Railway

1. Crea el servicio de PostgreSQL y el servicio del backend en el mismo proyecto.
2. En el backend define `DATABASE_URL` (referencia al Postgres), `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD` y, si aplica, `NOTIFICACIONES_SERVICE_URL` y `TIMEZONE_NEGOCIO`.
3. El `Dockerfile` compila el proyecto y arranca con `npx prisma migrate deploy && node dist/main.js`, así que las migraciones se aplican en cada despliegue.
4. Genera el dominio público en *Settings → Networking*. El frontend debe apuntar a él con `VITE_API_URL=https://<dominio>/api` (Vite lo incorpora en el build: hace falta un **redeploy** del frontend al cambiarlo).
5. Los hosts `*.railway.internal` solo funcionan entre servicios del proyecto; el navegador no puede usarlos.
6. Para cargar los datos iniciales, ejecuta `npx prisma db seed` en el entorno del backend (con `tsx` instalado).

---

## Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| `spawn tsx ENOENT` al hacer seed | Falta `tsx`. Instálalo con `npm install -D tsx` y confirma que está en `package.json`. |
| `P2021: table public.empresa does not exist` | El schema tiene modelos que ninguna migración crea. Genera la migración faltante con `prisma migrate dev` y súbela al repositorio. |
| `migrate deploy` dice «No pending migrations» pero faltan tablas | El historial de `_prisma_migrations` no coincide con la base. Revisa con `npx prisma migrate status` y compara con `\dt`. |
| `404` «El salón … no fue encontrado» | Slug inexistente. Verifica el header `x-tenant-slug` y que el seed se haya ejecutado. |
| La reserva devuelve «El horario seleccionado ya no está disponible» | Otra persona reservó esa hora, ya pasó, o cae fuera de los turnos. Vuelve a pedir `/disponibilidad`. |
| Las horas de hoy se bloquean a destiempo | Ajusta `TIMEZONE_NEGOCIO` a la zona horaria del salón. |

---

## Limitaciones conocidas y seguridad

Es un MVP y hay puntos que conviene reforzar antes de manejar datos reales:

- **Rutas de administración expuestas sin autenticación.** Varios routers se montan también en la API pública, por lo que `PATCH /api/configuracion`, `POST /api/servicios`, `POST /api/disenos` y `GET /api/clientes` funcionan sin token. Deberían quedar solo bajo `/api/admin`, dejando públicas únicamente las lecturas necesarias (`GET /configuracion`, `GET /servicios`).
- **El login con la tabla `Usuario` no valida contraseña:** basta con conocer el email. El acceso por variables de entorno sí la valida.
- **`/auth/google` no verifica la firma del token de Google:** solo lo decodifica y acepta `rol` y `email` enviados por el cliente.
- **El middleware de autenticación no comprueba el rol ni la empresa del token:** cualquier JWT válido (incluido el de una clienta) puede llamar a `/api/admin/*` en cualquier salón indicado por `x-tenant-slug`.
- **`GET /api/reservas/:id` y `PATCH /api/reservas/:id/cancelar` son públicos:** cualquiera con el id de una reserva puede consultarla o cancelarla.
- **CORS abierto** (`cors()` sin restricciones). En producción conviene limitarlo a los dominios del frontend.
- **Secretos por defecto** (`JWT_SECRET`, `ADMIN_PASSWORD`): deben definirse siempre en producción.
- **Disponibilidad por salón, no por estilista:** una cita bloquea la hora para todo el salón.
- **Sin fechas bloqueadas puntuales** (feriados, vacaciones): hoy solo se configuran días de la semana y temporadas por mes.
