import { Router } from 'express';
import { prisma } from '../../config/database';

export const clienteRouter = Router();

// Busca un cliente existente por teléfono o lo crea si no existe
export async function buscarOCrearCliente(data: { nombre: string; telefono: string; email?: string }) {
  const existente = await prisma.cliente.findFirst({ where: { telefono: data.telefono } });
  if (existente) return existente;
  return prisma.cliente.create({ data });
}

clienteRouter.get('/', async (_req, res) => {
  const clientes = await prisma.cliente.findMany({ orderBy: { fechaRegistro: 'desc' } });
  res.json(clientes);
});

clienteRouter.get('/:id', async (req, res) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: req.params.id },
    include: { reservas: true },
  });
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
});
