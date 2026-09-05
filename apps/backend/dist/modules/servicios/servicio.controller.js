"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicioRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.servicioRouter = (0, express_1.Router)();
// GET /api/servicios -> lista de servicios activos
exports.servicioRouter.get('/', async (_req, res) => {
    const servicios = await database_1.prisma.servicio.findMany({ where: { activo: true } });
    res.json(servicios);
});
// GET /api/servicios/:id/disenos -> diseños disponibles para un servicio
exports.servicioRouter.get('/:id/disenos', async (req, res) => {
    const { id } = req.params;
    const disenos = await database_1.prisma.diseno.findMany({
        where: { OR: [{ servicioId: id }, { servicioId: null }] },
    });
    res.json(disenos);
});
// POST /api/servicios (admin)
exports.servicioRouter.post('/', async (req, res) => {
    const { nombre, descripcion, duracionMinutos, precioBase } = req.body;
    const servicio = await database_1.prisma.servicio.create({
        data: { nombre, descripcion, duracionMinutos, precioBase },
    });
    res.status(201).json(servicio);
});
