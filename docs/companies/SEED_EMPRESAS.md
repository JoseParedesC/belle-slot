# SEED — DAHOOD24 y JC Nails

## Objetivo

El seed debe crear dos tenants independientes:

- **DAHOOD24**
- **JC Nails**

Cada registro de negocio debe quedar asociado a un `empresaId`.

> Los nombres de las empresas son los solicitados. Los datos de contacto no proporcionados se dejan como `Por configurar` para no inventar información real.

## 1. DAHOOD24

### Identidad

```text
nombre: DAHOOD24
slug: dahood24
id: empresa-dahood24
plan: pro
activo: true
```

### Configuración seed

```text
dirección: Por configurar
WhatsApp: Por configurar
email: Por configurar
apertura: 09:00
cierre: 18:00
días: Lunes a Sábado
bloque: 30 minutos
cancelación: 12 horas
```

### Paleta

La documentación proporcionada define a DAHOOD24 como una marca urbana, sobria y premium, basada principalmente en negro, gris y blanco, con Acid Lime y Blood Red como acentos. fileciteturn0file0L5-L8

```text
colorPrimario:   #0A0A0A
colorSecundario: #141414
colorAcento:     #B6FF00
colorFondo:      #0A0A0A
```

Paleta completa disponible en el documento original:

```text
#0A0A0A  Obsidian
#141414  Carbon
#1C1C1C  Charcoal
#292929  Graphite
#444444  Concrete
#666666  Steel
#999999  Ash
#C7C7C7  Silver
#E8E8E8  Off White
#FFFFFF  White
#B6FF00  Acid Lime
#8F1010  Blood Red
```

La recomendación del documento es mantener aproximadamente 90–95 % de negro/blanco/grises y 5–10 % de acentos. fileciteturn0file0L61-L70

### Personal seed

```text
Mariana López
mariana.dahood24@seed.local

Andrea Martínez
andrea.dahood24@seed.local
```

### Servicios

```text
Asesoría de estilo
60 min
$0 (precio por configurar)

Personal Shopping
90 min
$0 (precio por configurar)
```

## 2. JC Nails

### Identidad

```text
nombre: JC Nails
slug: jc-nails
id: empresa-jc-nails
plan: pro
activo: true
```

### Configuración seed

```text
dirección: Por configurar
WhatsApp: Por configurar
email: Por configurar
apertura: 09:00
cierre: 18:00
días: Lunes a Sábado
bloque: 30 minutos
cancelación: 12 horas
```

### Paleta

Para **JC Nails** se reutiliza la paleta que estaba configurada previamente para **Belle Slot Studio** en el seed original:

```text
colorPrimario:   #d94676
colorSecundario: #8c1e40
colorAcento:     #c29057
colorFondo:      #faf6f8
```

Esto es una decisión del seed, no una afirmación de que sea la identidad visual oficial de JC Nails.

### Personal seed

```text
Valeria Rodríguez
valeria.jcnails@seed.local

Camila Herrera
camila.jcnails@seed.local
```

### Servicios

```text
Manicure semipermanente
60 min
$25.000

Pedicure semipermanente
60 min
$35.000

Nail Art
30 min
$10.000
```

## 3. Usuarios administrativos

### Superadmin

```text
email: superadmin@saas.local
rol: superadmin
empresaId: null
```

### DAHOOD24

```text
email: admin@dahood24.local
rol: admin_empresa
empresaId: empresa-dahood24
```

### JC Nails

```text
email: admin@jcnails.local
rol: admin_empresa
empresaId: empresa-jc-nails
```

## 4. Aislamiento multi-tenant

La estructura esperada es:

```text
DAHOOD24
├── empleados
├── servicios
├── clientes
├── reservas
└── usuario admin

JC Nails
├── empleados
├── servicios
├── clientes
├── reservas
└── usuario admin
```

Toda consulta de datos de negocio debe filtrar por `empresaId`:

```ts
await prisma.servicio.findMany({
  where: {
    empresaId: tenantId,
  },
});
```

No se debe usar una consulta global como:

```ts
await prisma.servicio.findMany();
```

en endpoints que trabajan dentro del contexto de una empresa.

## 5. Registros huérfanos

El seed mantiene la compatibilidad con registros existentes cuyo `empresaId` sea `null` y los asigna inicialmente a DAHOOD24.

Esto debe verse como una migración inicial. En producción, los nuevos registros deben recibir siempre su `empresaId` desde la creación.

## 6. Nota importante

No se agregaron teléfonos, direcciones, correos personales ni nombres de empleados reales no proporcionados. Los correos `@seed.local` son cuentas ficticias exclusivamente para pruebas.
