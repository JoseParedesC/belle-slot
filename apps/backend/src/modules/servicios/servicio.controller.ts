import { Router } from 'express';
import { prisma } from '../../config/database';

export const servicioRouter = Router();

// GET /api/servicios -> lista de servicios activos del salón actual
servicioRouter.get('/', async (req, res) => {
  try {
    const empresaId = req.empresa?.id;
    const where: any = { activo: true };
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const servicios = await prisma.servicio.findMany({
      where,
      orderBy: { precioBase: 'asc' },
    });
    res.json(servicios);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/servicios/:id/disenos -> diseños disponibles para un servicio
servicioRouter.get('/:id/disenos', async (req, res) => {
  try {
    const { id } = req.params;
    const disenos = await prisma.diseno.findMany({
      where: { OR: [{ servicioId: id }, { servicioId: null }] },
    });
    res.json(disenos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/servicios (admin)
servicioRouter.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, duracionMinutos, precioBase } = req.body;
    const empresaId = req.empresa?.id;

    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion,
        duracionMinutos: Number(duracionMinutos),
        precioBase,
        empresaId,
      },
    });
    res.status(201).json(servicio);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
