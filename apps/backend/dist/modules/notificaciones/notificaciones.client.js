"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificarConfirmacionReserva = notificarConfirmacionReserva;
exports.notificarRecordatorio = notificarRecordatorio;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../../config/database");
const NOTIFICACIONES_URL = process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3001';
async function enviarNotificacion(input) {
    // Determinar qué canales quedarán registrados (uno o dos registros si es "ambos")
    const canalesARegistrar = input.canal === 'ambos' ? ['email', 'whatsapp'] : [input.canal];
    let estadoEnvio = 'enviado';
    try {
        await axios_1.default.post(`${NOTIFICACIONES_URL}/send-reminder`, input);
    }
    catch (err) {
        estadoEnvio = 'fallido';
    }
    // Registrar cada intento en la tabla Notificacion, sin bloquear el flujo si falla el registro
    for (const canal of canalesARegistrar) {
        await database_1.prisma.notificacion
            .create({
            data: {
                reservaId: input.reserva_id,
                canal,
                tipo: input.tipo,
                estadoEnvio,
                fechaEnvio: estadoEnvio === 'enviado' ? new Date() : null,
            },
        })
            .catch((err) => console.error('Error registrando notificación:', err.message));
    }
    if (estadoEnvio === 'fallido')
        throw new Error('Fallo el envío de la notificación');
}
async function notificarConfirmacionReserva(reserva, cliente, servicio) {
    return enviarNotificacion({
        reserva_id: reserva.id,
        cliente: { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email },
        canal: cliente.email ? 'ambos' : 'whatsapp',
        tipo: 'confirmacion_reserva',
        datos_cita: {
            fecha: reserva.fecha.toISOString().split('T')[0],
            hora: reserva.horaInicio,
            servicio: servicio.nombre,
        },
    });
}
async function notificarRecordatorio(reserva, cliente, servicio, tipo) {
    return enviarNotificacion({
        reserva_id: reserva.id,
        cliente: { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email },
        canal: cliente.email ? 'ambos' : 'whatsapp',
        tipo,
        datos_cita: {
            fecha: reserva.fecha.toISOString().split('T')[0],
            hora: reserva.horaInicio,
            servicio: servicio.nombre,
        },
    });
}
