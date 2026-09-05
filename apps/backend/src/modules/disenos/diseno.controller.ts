import { Router } from 'express';
import { prisma } from '../../config/database';

export const disenoRouter = Router();

disenoRouter.get('/', async (_req, res) => {
  const disenos = await prisma.diseno.findMany();
  res.json(disenos);
});

disenoRouter.post('/', async (req, res) => {
  const { nombre, incrementoPrecio, servicioId, imagenReferenciaUrl } = req.body;
  const diseno = await prisma.diseno.create({
    data: { nombre, incrementoPrecio, servicioId, imagenReferenciaUrl },
  });
  res.status(201).json(diseno);
});
