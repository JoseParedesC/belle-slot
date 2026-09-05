import { Router } from 'express';
import { prisma } from '../../config/database';

export const configuracionRouter = Router();

// GET /api/configuracion -> horarios, banner, políticas (público, lo usa el frontend)
configuracionRouter.get('/', async (_req, res) => {
  const config = await prisma.configuracionNegocio.findFirst();
  res.json(config);
});

// PATCH /api/admin/configuracion (admin)
configuracionRouter.patch('/', async (req, res) => {
  const config = await prisma.configuracionNegocio.findFirst();
  if (!config) return res.status(404).json({ error: 'Configuración no inicializada' });
  const actualizado = await prisma.configuracionNegocio.update({
    where: { id: config.id },
    data: req.body,
  });
  res.json(actualizado);
});
