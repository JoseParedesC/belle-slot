import { Router } from 'express';
import { prisma } from '../../config/database';

export const servicioRouter = Router();

// GET /api/servicios -> lista de servicios activos
servicioRouter.get('/', async (_req, res) => {
  const servicios = await prisma.servicio.findMany({ where: { activo: true } });
  res.json(servicios);
});

// GET /api/servicios/:id/disenos -> diseños disponibles para un servicio
servicioRouter.get('/:id/disenos', async (req, res) => {
  const { id } = req.params;
  const disenos = await prisma.diseno.findMany({
    where: { OR: [{ servicioId: id }, { servicioId: null }] },
  });
  res.json(disenos);
});

// POST /api/servicios (admin)
servicioRouter.post('/', async (req, res) => {
  const { nombre, descripcion, duracionMinutos, precioBase } = req.body;
  const servicio = await prisma.servicio.create({
    data: { nombre, descripcion, duracionMinutos, precioBase },
  });
  res.status(201).json(servicio);
});
