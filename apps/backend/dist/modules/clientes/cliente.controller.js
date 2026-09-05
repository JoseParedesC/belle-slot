"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteRouter = void 0;
exports.buscarOCrearCliente = buscarOCrearCliente;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.clienteRouter = (0, express_1.Router)();
// Busca un cliente existente por teléfono o lo crea si no existe
async function buscarOCrearCliente(data) {
    const existente = await database_1.prisma.cliente.findFirst({ where: { telefono: data.telefono } });
    if (existente)
        return existente;
    return database_1.prisma.cliente.create({ data });
}
exports.clienteRouter.get('/', async (_req, res) => {
    const clientes = await database_1.prisma.cliente.findMany({ orderBy: { fechaRegistro: 'desc' } });
    res.json(clientes);
});
exports.clienteRouter.get('/:id', async (req, res) => {
    const cliente = await database_1.prisma.cliente.findUnique({
        where: { id: req.params.id },
        include: { reservas: true },
    });
    if (!cliente)
        return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
});
