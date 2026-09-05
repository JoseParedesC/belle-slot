"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicioRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.servicioRouter = (0, express_1.Router)();
// GET /api/servicios -> lista de servicios activos del salón actual
exports.servicioRouter.get('/', async (req, res) => {
    try {
        const empresaId = req.empresa?.id;
        const where = { activo: true };
        if (empresaId) {
            where.empresaId = empresaId;
        }
        const servicios = await database_1.prisma.servicio.findMany({
            where,
            orderBy: { precioBase: 'asc' },
        });
        res.json(servicios);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/servicios/:id/disenos -> diseños disponibles para un servicio
exports.servicioRouter.get('/:id/disenos', async (req, res) => {
    try {
        const { id } = req.params;
        const disenos = await database_1.prisma.diseno.findMany({
            where: { OR: [{ servicioId: id }, { servicioId: null }] },
        });
        res.json(disenos);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/servicios (admin)
exports.servicioRouter.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, duracionMinutos, precioBase } = req.body;
        const empresaId = req.empresa?.id;
        const servicio = await database_1.prisma.servicio.create({
            data: {
                nombre,
                descripcion,
                duracionMinutos: Number(duracionMinutos),
                precioBase,
                empresaId,
            },
        });
        res.status(201).json(servicio);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
