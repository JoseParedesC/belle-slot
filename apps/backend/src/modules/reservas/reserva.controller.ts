import { Router } from 'express';
import { prisma } from '../../config/database';
import { calcularDisponibilidad } from './disponibilidad.service';
import { crearReserva, cancelarReserva, obtenerReserva, cambiarEstadoReserva } from './reserva.service';
import { crearReservaSchema } from './reserva.schema';

export const reservaRouter = Router();
export const adminReservaRouter = Router();

// GET /api/disponibilidad?fecha=YYYY-MM-DD&servicio_id=...
reservaRouter.get('/disponibilidad', async (req, res) => {
  try {
    const { fecha, servicio_id } = req.query as { fecha: string; servicio_id: string };
    if (!fecha || !servicio_id) {
      return res.status(400).json({ error: 'fecha y servicio_id son requeridos' });
    }
    const horarios = await calcularDisponibilidad(fecha, servicio_id);
    res.json({ fecha, servicio_id, horarios_disponibles: horarios });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/reservas
reservaRouter.post('/reservas', async (req, res) => {
  const parsed = crearReservaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(', ') });
  }
  try {
    const { cliente, servicio_id, diseno_id, fecha, hora_inicio } = parsed.data;
    const reserva = await crearReserva({
      cliente,
      servicioId: servicio_id,
      disenoId: diseno_id,
      fecha,
      horaInicio: hora_inicio,
    });
    res.status(201).json(reserva);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reservas/:id
reservaRouter.get('/reservas/:id', async (req, res) => {
  const reserva = await obtenerReserva(req.params.id);
  if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
  res.json(reserva);
});

// PATCH /api/reservas/:id/cancelar
reservaRouter.patch('/reservas/:id/cancelar', async (req, res) => {
  try {
    const reserva = await cancelarReserva(req.params.id, req.body?.motivo);
    res.json(reserva);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Rutas de administración ----

// GET /api/admin/reservas?fecha=YYYY-MM-DD
adminReservaRouter.get('/reservas', async (req, res) => {
  const { fecha } = req.query as { fecha?: string };
  const reservas = await prisma.reserva.findMany({
    where: fecha ? { fecha: new Date(fecha) } : {},
    include: { cliente: true, servicio: true, diseno: true },
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });
  res.json(reservas);
});

// PATCH /api/admin/reservas/:id/estado
adminReservaRouter.patch('/reservas/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const reserva = await cambiarEstadoReserva(req.params.id, estado);
    res.json(reserva);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/reportes/ocupacion
adminReservaRouter.get('/reportes/ocupacion', async (_req, res) => {
  const total = await prisma.reserva.count();
  const porEstado = await prisma.reserva.groupBy({ by: ['estado'], _count: true });
  res.json({ total, por_estado: porEstado });
});
