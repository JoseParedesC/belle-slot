"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularDisponibilidad = calcularDisponibilidad;
exports.calcularHoraFin = calcularHoraFin;
const database_1 = require("../../config/database");
/**
 * Convierte "HH:mm" a minutos desde medianoche
 */
function aMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}
function aHora(minutos) {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0');
    const m = (minutos % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
/**
 * Calcula los bloques de horario disponibles para una fecha y servicio dados,
 * evitando solapamientos con reservas ya existentes ese día.
 */
async function calcularDisponibilidad(fecha, servicioId) {
    const servicio = await database_1.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio)
        throw new Error('Servicio no encontrado');
    const config = await database_1.prisma.configuracionNegocio.findFirst();
    if (!config)
        throw new Error('Configuración del negocio no definida');
    const inicioNegocio = aMinutos(config.horarioApertura);
    const finNegocio = aMinutos(config.horarioCierre);
    const bloque = config.duracionBloqueMinutos;
    const duracionServicio = servicio.duracionMinutos;
    const reservasDelDia = await database_1.prisma.reserva.findMany({
        where: {
            fecha: new Date(fecha),
            estado: { in: ['pendiente', 'confirmada'] },
        },
    });
    const ocupados = reservasDelDia.map((r) => ({
        inicio: aMinutos(r.horaInicio),
        fin: aMinutos(r.horaFin),
    }));
    const disponibles = [];
    for (let inicio = inicioNegocio; inicio + duracionServicio <= finNegocio; inicio += bloque) {
        const fin = inicio + duracionServicio;
        const seSolapa = ocupados.some((o) => inicio < o.fin && fin > o.inicio);
        if (!seSolapa)
            disponibles.push(aHora(inicio));
    }
    return disponibles;
}
function calcularHoraFin(horaInicio, duracionMinutos) {
    return aHora(aMinutos(horaInicio) + duracionMinutos);
}
