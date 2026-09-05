-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('email', 'whatsapp');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('confirmacion_reserva', 'recordatorio_24h', 'recordatorio_2h', 'cancelacion');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('pendiente', 'enviado', 'fallido');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'pagado', 'reembolsado', 'perdido_por_inasistencia');

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "cantidad_inasistencias" INTEGER NOT NULL DEFAULT 0,
    "notas_internas" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracion_minutos" INTEGER NOT NULL,
    "precio_base" DECIMAL(65,30) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diseno" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "incremento_precio" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "servicio_id" TEXT,
    "imagen_referencia_url" TEXT,

    CONSTRAINT "diseno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleada" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "empleada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "diseno_id" TEXT,
    "empleada_id" TEXT,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "precio_estimado" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'pendiente',
    "recordatorio_24h_enviado" BOOLEAN NOT NULL DEFAULT false,
    "recordatorio_2h_enviado" BOOLEAN NOT NULL DEFAULT false,
    "confirmada_por_cliente" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cancelacion" TIMESTAMP(3),
    "motivo_cancelacion" TEXT,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "canal" "CanalNotificacion" NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "estado_envio" "EstadoEnvio" NOT NULL DEFAULT 'pendiente',
    "fecha_envio" TIMESTAMP(3),
    "respuesta_cliente" TEXT,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_negocio" (
    "id" TEXT NOT NULL,
    "horario_apertura" TEXT NOT NULL,
    "horario_cierre" TEXT NOT NULL,
    "dias_atencion" JSONB NOT NULL,
    "duracion_bloque_minutos" INTEGER NOT NULL DEFAULT 30,
    "horas_anticipacion_cancelacion" INTEGER NOT NULL DEFAULT 12,
    "texto_banner_precio" TEXT,

    CONSTRAINT "configuracion_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago_deposito" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "monto_deposito" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "proveedor_pago" TEXT,
    "referencia_transaccion" TEXT,

    CONSTRAINT "pago_deposito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pago_deposito_reserva_id_key" ON "pago_deposito"("reserva_id");

-- AddForeignKey
ALTER TABLE "diseno" ADD CONSTRAINT "diseno_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_diseno_id_fkey" FOREIGN KEY ("diseno_id") REFERENCES "diseno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_empleada_id_fkey" FOREIGN KEY ("empleada_id") REFERENCES "empleada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_deposito" ADD CONSTRAINT "pago_deposito_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
