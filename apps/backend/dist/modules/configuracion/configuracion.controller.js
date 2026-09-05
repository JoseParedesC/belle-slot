"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuracionRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.configuracionRouter = (0, express_1.Router)();
// GET /api/configuracion -> horarios, banner, políticas (público, lo usa el frontend)
exports.configuracionRouter.get('/', async (_req, res) => {
    const config = await database_1.prisma.configuracionNegocio.findFirst();
    res.json(config);
});
// PATCH /api/admin/configuracion (admin)
exports.configuracionRouter.patch('/', async (req, res) => {
    const config = await database_1.prisma.configuracionNegocio.findFirst();
    if (!config)
        return res.status(404).json({ error: 'Configuración no inicializada' });
    const actualizado = await database_1.prisma.configuracionNegocio.update({
        where: { id: config.id },
        data: req.body,
    });
    res.json(actualizado);
});
