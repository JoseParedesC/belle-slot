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
 * respetando los horarios y reservas del salón específico.
 */
async function calcularDisponibilidad(fecha, servicioId, empresaId) {
    const servicio = await database_1.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio)
        throw new Error('Servicio no encontrado');
    const resolvedEmpresaId = empresaId || servicio.empresaId;
    let config = null;
    if (resolvedEmpresaId) {
        config = await database_1.prisma.empresa.findUnique({ where: { id: resolvedEmpresaId } });
    }
    if (!config) {
        config = await database_1.prisma.configuracionNegocio.findFirst();
    }
    const horarioApertura = config?.horarioApertura || '09:00';
    const horarioCierre = config?.horarioCierre || '18:00';
    const bloque = config?.duracionBloqueMinutos || 30;
    const inicioNegocio = aMinutos(horarioApertura);
    const finNegocio = aMinutos(horarioCierre);
    const duracionServicio = servicio.duracionMinutos;
    const whereReservas = {
        fecha: new Date(fecha),
        estado: { in: ['pendiente', 'confirmada'] },
    };
    if (resolvedEmpresaId) {
        whereReservas.empresaId = resolvedEmpresaId;
    }
    const reservasDelDia = await database_1.prisma.reserva.findMany({
        where: whereReservas,
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
