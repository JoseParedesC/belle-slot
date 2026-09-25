# Modelo de Datos — Sistema de Reservas para Local de Manicure

## Índice
1. Entidades principales
2. Diagrama de relaciones (texto)
3. Detalle de cada entidad
4. Estados y transiciones
5. Consideraciones para el MVP vs. futuro

---

## 1. Entidades principales

| Entidad | Descripción |
|---|---|
| `Cliente` | Persona que reserva el servicio |
| `Servicio` | Tipo de servicio ofrecido (manicure, pedicure, semipermanente, etc.) |
| `Diseño` | Nivel de complejidad/diseño aplicable a un servicio, afecta el precio final |
| `Empleada` / `Manicurista` | Quien atiende (opcional en MVP si hay una sola persona) |
| `Reserva` | El corazón del sistema — une cliente, servicio, diseño, fecha y hora |
| `Notificación` | Registro de cada recordatorio enviado (email/WhatsApp) |
| `Pago/Depósito` | Registro de seña cobrada (fase futura, no MVP) |
| `Configuración del negocio` | Horarios de atención, duración de bloques, políticas |

---

## 2. Diagrama de relaciones (texto)

```
Cliente 1---N Reserva
Servicio 1---N Reserva
Diseño 1---N Reserva  (opcional, puede ser null)
Empleada 1---N Reserva (opcional en MVP)
Reserva 1---N Notificación
Reserva 1---1 Pago/Depósito (fase futura)
```

---

## 3. Detalle de cada entidad

### 3.1 Cliente

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `nombre` | string | Requerido |
| `telefono` | string | Requerido — usado para WhatsApp |
| `email` | string | Opcional en MVP si el canal principal es WhatsApp |
| `fecha_registro` | datetime | Auto |
| `cantidad_inasistencias` | int | Contador de "no-show", default 0 — clave para políticas futuras de depósito obligatorio |
| `notas_internas` | text | Opcional — uso interno del negocio |

### 3.2 Servicio

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `nombre` | string | Ej: "Manicure semipermanente" |
| `descripcion` | text | Opcional |
| `duracion_minutos` | int | Usado para calcular disponibilidad en el calendario |
| `precio_base` | decimal | Precio mínimo, antes de aplicar diseño |
| `activo` | boolean | Para poder desactivar servicios sin borrarlos |

### 3.3 Diseño

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `nombre` | string | Ej: "Nail art simple", "Decoración 3D" |
| `incremento_precio` | decimal | Monto o % que se suma al precio base |
| `servicio_id` | FK (opcional) | Si el diseño solo aplica a ciertos servicios |
| `imagen_referencia_url` | string | Opcional — para mostrar catálogo visual al cliente |

> Aquí es donde conecta tu banner: al elegir el diseño, el precio final = `precio_base + incremento_precio`, y el banner explica esta lógica antes de confirmar.

### 3.4 Empleada / Manicurista (opcional en MVP)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `nombre` | string | |
| `activo` | boolean | |
| `horario_disponible` | JSON / tabla aparte | Días y horas que atiende |

### 3.5 Reserva (entidad central)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `cliente_id` | FK | Requerido |
| `servicio_id` | FK | Requerido |
| `diseño_id` | FK | Opcional (null = diseño simple, sin incremento) |
| `empleada_id` | FK | Opcional en MVP |
| `fecha` | date | Requerido |
| `hora_inicio` | time | Requerido |
| `hora_fin` | time | Calculada según duración del servicio |
| `precio_estimado` | decimal | Calculado al momento de reservar |
| `estado` | enum | Ver sección 4 |
| `recordatorio_24h_enviado` | boolean | Evita reenvíos duplicados |
| `recordatorio_2h_enviado` | boolean | Evita reenvíos duplicados |
| `confirmada_por_cliente` | boolean | Si implementan confirmación obligatoria más adelante |
| `fecha_creacion` | datetime | Auto |
| `fecha_cancelacion` | datetime | Null si no se canceló |
| `motivo_cancelacion` | text | Opcional |

### 3.6 Notificación

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `reserva_id` | FK | Requerido |
| `canal` | enum | `email`, `whatsapp` |
| `tipo` | enum | `confirmacion_reserva`, `recordatorio_24h`, `recordatorio_2h`, `cancelacion` |
| `estado_envio` | enum | `pendiente`, `enviado`, `fallido` |
| `fecha_envio` | datetime | |
| `respuesta_cliente` | string | Opcional — si el cliente responde "CONFIRMAR"/"CANCELAR" por WhatsApp |

### 3.7 Pago / Depósito (fase futura — no MVP)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK |
| `reserva_id` | FK | Requerido |
| `monto_deposito` | decimal | |
| `estado` | enum | `pendiente`, `pagado`, `reembolsado`, `perdido_por_inasistencia` |
| `proveedor_pago` | string | Ej: pasarela bancaria a integrar |
| `referencia_transaccion` | string | ID que devuelve el banco/pasarela |

### 3.8 Configuración del negocio

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID / int | PK (generalmente un solo registro) |
| `horario_apertura` | time | |
| `horario_cierre` | time | |
| `dias_atencion` | JSON | Ej: ["Lunes","Martes",...] |
| `duracion_bloque_minutos` | int | Ej: bloques de 30 min para el calendario |
| `horas_anticipacion_cancelacion` | int | Ej: 12h — política de cancelación |
| `texto_banner_precio` | string | Editable — el texto del banner de aviso de precio variable |

---

## 4. Estados y transiciones de una Reserva

```
pendiente → confirmada → completada
    ↓            ↓
cancelada    no_asistio (no-show)
```

| Estado | Significado |
|---|---|
| `pendiente` | Reserva creada, aún no confirmada (si aplican confirmación obligatoria) |
| `confirmada` | Cliente confirmó asistencia (o no se requiere confirmación en el MVP) |
| `completada` | El servicio fue realizado |
| `cancelada` | Cliente o negocio canceló antes de la fecha |
| `no_asistio` | Cliente no llegó — dispara incremento en `cantidad_inasistencias` del cliente |

---

## 5. Consideraciones MVP vs. Futuro

**MVP (fase actual):**
- Cliente, Servicio, Diseño, Reserva, Notificación (email + WhatsApp)
- Sin gestión de múltiples empleadas (si aplica, se puede omitir esa tabla)
- Sin cobro de depósito — tabla `Pago` no se implementa aún, pero el modelo ya la contempla para no rediseñar después

**Futuro (con integración bancaria):**
- Activar tabla `Pago/Depósito`
- Reglas automáticas: si `cantidad_inasistencias` del cliente ≥ N, la reserva requiere depósito obligatorio antes de confirmarse
- Reportes de ocupación y tasa de inasistencia por servicio/diseño

---

## Notas de arquitectura relacionadas

- El microservicio de **notificaciones** (correo + WhatsApp) consume los datos de `Reserva` + `Cliente` y escribe en la tabla `Notificación` el resultado de cada envío.
- Un **scheduler/cron** en el backend (o en el propio microservicio de notificaciones) revisa periódicamente las reservas con `fecha` próxima y `recordatorio_24h_enviado = false` para disparar los envíos correspondientes.
