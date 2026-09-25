import { Router } from 'express';
import { prisma } from '../../config/database';

export const clienteRouter = Router();

// Busca un cliente existente por teléfono en la empresa o lo crea si no existe
export async function buscarOCrearCliente(
  data: { nombre: string; telefono: string; email?: string },
  empresaId?: string
) {
  const where: any = { telefono: data.telefono };
  if (empresaId) where.empresaId = empresaId;

  const existente = await prisma.cliente.findFirst({ where });
  if (existente) return existente;

  return prisma.cliente.create({
    data: {
      ...data,
      empresaId,
    },
  });
}

clienteRouter.get('/', async (req, res) => {
  const where: any = {};
  if (req.empresa?.id) where.empresaId = req.empresa.id;

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { fechaRegistro: 'desc' },
  });
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
