"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearReserva = crearReserva;
exports.cancelarReserva = cancelarReserva;
exports.cambiarEstadoReserva = cambiarEstadoReserva;
exports.obtenerReserva = obtenerReserva;
const database_1 = require("../../config/database");
const disponibilidad_service_1 = require("./disponibilidad.service");
const cliente_controller_1 = require("../clientes/cliente.controller");
const notificaciones_client_1 = require("../notificaciones/notificaciones.client");
async function crearReserva(input) {
    const { cliente, servicioId, disenoId, fecha, horaInicio } = input;
    const servicio = await database_1.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio)
        throw new Error('Servicio no encontrado');
    // Revalidar disponibilidad en el servidor (nunca confiar solo en el frontend)
    const disponibles = await (0, disponibilidad_service_1.calcularDisponibilidad)(fecha, servicioId);
    if (!disponibles.includes(horaInicio)) {
        throw new Error('El horario seleccionado ya no está disponible');
    }
    let precioEstimado = Number(servicio.precioBase);
    if (disenoId) {
        const diseno = await database_1.prisma.diseno.findUnique({ where: { id: disenoId } });
        if (diseno)
            precioEstimado += Number(diseno.incrementoPrecio);
    }
    const horaFin = (0, disponibilidad_service_1.calcularHoraFin)(horaInicio, servicio.duracionMinutos);
    const clienteRegistrado = await (0, cliente_controller_1.buscarOCrearCliente)(cliente);
    const reserva = await database_1.prisma.reserva.create({
        data: {
            clienteId: clienteRegistrado.id,
            servicioId,
            disenoId,
            fecha: new Date(fecha),
            horaInicio,
            horaFin,
            precioEstimado,
            estado: 'pendiente',
        },
    });
    // Disparar notificación de confirmación (no bloquear la respuesta si falla)
    (0, notificaciones_client_1.notificarConfirmacionReserva)(reserva, clienteRegistrado, servicio).catch((err) => console.error('Error notificando confirmación de reserva:', err.message));
    return reserva;
}
async function cancelarReserva(id, motivo) {
    return database_1.prisma.reserva.update({
        where: { id },
        data: { estado: 'cancelada', fechaCancelacion: new Date(), motivoCancelacion: motivo },
    });
}
async function cambiarEstadoReserva(id, estado) {
    const reserva = await database_1.prisma.reserva.update({ where: { id }, data: { estado } });
    if (estado === 'no_asistio') {
        await database_1.prisma.cliente.update({
            where: { id: reserva.clienteId },
            data: { cantidadInasistencias: { increment: 1 } },
        });
    }
    return reserva;
}
async function obtenerReserva(id) {
    return database_1.prisma.reserva.findUnique({
        where: { id },
        include: { cliente: true, servicio: true, diseno: true },
    });
}
