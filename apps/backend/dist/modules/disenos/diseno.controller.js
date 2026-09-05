"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disenoRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.disenoRouter = (0, express_1.Router)();
exports.disenoRouter.get('/', async (_req, res) => {
    const disenos = await database_1.prisma.diseno.findMany();
    res.json(disenos);
});
exports.disenoRouter.post('/', async (req, res) => {
    const { nombre, incrementoPrecio, servicioId, imagenReferenciaUrl } = req.body;
    const diseno = await database_1.prisma.diseno.create({
        data: { nombre, incrementoPrecio, servicioId, imagenReferenciaUrl },
    });
    res.status(201).json(diseno);
});
