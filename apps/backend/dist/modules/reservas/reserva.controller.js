"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReservaRouter = exports.reservaRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
const disponibilidad_service_1 = require("./disponibilidad.service");
const reserva_service_1 = require("./reserva.service");
const reserva_schema_1 = require("./reserva.schema");
exports.reservaRouter = (0, express_1.Router)();
exports.adminReservaRouter = (0, express_1.Router)();
// GET /api/disponibilidad?fecha=YYYY-MM-DD&servicio_id=...
exports.reservaRouter.get('/disponibilidad', async (req, res) => {
    try {
        const { fecha, servicio_id } = req.query;
        if (!fecha || !servicio_id) {
            return res.status(400).json({ error: 'fecha y servicio_id son requeridos' });
        }
        const horarios = await (0, disponibilidad_service_1.calcularDisponibilidad)(fecha, servicio_id);
        res.json({ fecha, servicio_id, horarios_disponibles: horarios });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /api/reservas
exports.reservaRouter.post('/reservas', async (req, res) => {
    const parsed = reserva_schema_1.crearReservaSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(', ') });
    }
    try {
        const { cliente, servicio_id, diseno_id, fecha, hora_inicio } = parsed.data;
        const reserva = await (0, reserva_service_1.crearReserva)({
            cliente,
            servicioId: servicio_id,
            disenoId: diseno_id,
            fecha,
            horaInicio: hora_inicio,
        });
        res.status(201).json(reserva);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /api/reservas/mis-reservas?email=...&telefono=...
exports.reservaRouter.get('/reservas/cliente/mis-reservas', async (req, res) => {
    try {
        const { email, telefono } = req.query;
        if (!email && !telefono) {
            return res.status(400).json({ error: 'Debes proporcionar email o teléfono' });
        }
        const whereCliente = {};
        if (email)
            whereCliente.email = email;
        if (telefono)
            whereCliente.telefono = telefono;
        const reservas = await database_1.prisma.reserva.findMany({
            where: {
                cliente: whereCliente,
            },
            include: {
                servicio: true,
                diseno: true,
                empleada: true,
            },
            orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }],
        });
        res.json(reservas);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/reservas/:id
exports.reservaRouter.get('/reservas/:id', async (req, res) => {
    const reserva = await (0, reserva_service_1.obtenerReserva)(req.params.id);
    if (!reserva)
        return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reserva);
});
// PATCH /api/reservas/:id/cancelar
exports.reservaRouter.patch('/reservas/:id/cancelar', async (req, res) => {
    try {
        const reserva = await (0, reserva_service_1.cancelarReserva)(req.params.id, req.body?.motivo);
        res.json(reserva);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// ---- Rutas de administración y estilistas ----
// GET /api/admin/reservas?fecha=YYYY-MM-DD&empleada_id=...
exports.adminReservaRouter.get('/reservas', async (req, res) => {
    const { fecha, empleada_id } = req.query;
    const where = {};
    if (fecha) {
        where.fecha = new Date(fecha);
    }
    if (empleada_id) {
        where.empleadaId = empleada_id;
    }
    const reservas = await database_1.prisma.reserva.findMany({
        where,
        include: { cliente: true, servicio: true, diseno: true, empleada: true },
        orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    });
    res.json(reservas);
});
// PATCH /api/admin/reservas/:id/estado
exports.adminReservaRouter.patch('/reservas/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const reserva = await (0, reserva_service_1.cambiarEstadoReserva)(req.params.id, estado);
        res.json(reserva);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /api/admin/reportes/ocupacion
exports.adminReservaRouter.get('/reportes/ocupacion', async (_req, res) => {
    const total = await database_1.prisma.reserva.count();
    const porEstado = await database_1.prisma.reserva.groupBy({ by: ['estado'], _count: true });
    res.json({ total, por_estado: porEstado });
});
