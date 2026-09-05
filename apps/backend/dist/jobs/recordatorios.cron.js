"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarCronRecordatorios = iniciarCronRecordatorios;
exports.procesarRecordatorios = procesarRecordatorios;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const notificaciones_client_1 = require("../modules/notificaciones/notificaciones.client");
/**
 * Corre cada 15 minutos. Busca reservas próximas (24h y 2h) que aún
 * no tengan su recordatorio enviado, y dispara la notificación.
 */
function iniciarCronRecordatorios() {
    node_cron_1.default.schedule('*/15 * * * *', async () => {
        await procesarRecordatorios();
    });
}
async function procesarRecordatorios() {
    const ahora = new Date();
    await procesarVentana(ahora, 24, 'recordatorio24hEnviado', 'recordatorio_24h');
    await procesarVentana(ahora, 2, 'recordatorio2hEnviado', 'recordatorio_2h');
}
async function procesarVentana(ahora, horasAntes, campoFlag, tipo) {
    const inicioVentana = new Date(ahora.getTime() + (horasAntes - 0.25) * 60 * 60 * 1000);
    const finVentana = new Date(ahora.getTime() + horasAntes * 60 * 60 * 1000);
    const reservas = await database_1.prisma.reserva.findMany({
        where: {
            estado: { in: ['pendiente', 'confirmada'] },
            [campoFlag]: false,
            fecha: { gte: inicioVentana, lte: finVentana },
        },
        include: { cliente: true, servicio: true },
    });
    for (const reserva of reservas) {
        try {
            await (0, notificaciones_client_1.notificarRecordatorio)(reserva, reserva.cliente, reserva.servicio, tipo);
            await database_1.prisma.reserva.update({
                where: { id: reserva.id },
                data: { [campoFlag]: true },
            });
        }
        catch (err) {
            console.error(`Error enviando ${tipo} para reserva ${reserva.id}:`, err);
        }
    }
}
