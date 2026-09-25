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
    const horarios = await calcularDisponibilidad(fecha, servicio_id, req.empresa?.id);
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
      empresaId: req.empresa?.id,
    });
    res.status(201).json(reserva);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reservas/cliente/mis-reservas?email=...&telefono=...
reservaRouter.get('/reservas/cliente/mis-reservas', async (req, res) => {
  try {
    const { email, telefono } = req.query as { email?: string; telefono?: string };
    if (!email && !telefono) {
      return res.status(400).json({ error: 'Debes proporcionar email o teléfono' });
    }

    const whereCliente: any = {};
    if (email) whereCliente.email = email;
    if (telefono) whereCliente.telefono = telefono;

    const where: any = { cliente: whereCliente };
    if (req.empresa?.id) {
      where.empresaId = req.empresa.id;
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        servicio: true,
        diseno: true,
        empleada: true,
      },
      orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }],
    });
    res.json(reservas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

// ---- Rutas de administración y estilistas ----

// GET /api/admin/reservas (con filtros por rango de fechas, cliente, servicio, estilista y estado)
adminReservaRouter.get('/reservas', async (req, res) => {
  const {
    fecha,
    fecha_inicio,
    fecha_fin,
    cliente,
    servicio_id,
    empleada_id,
    estado,
  } = req.query as {
    fecha?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    cliente?: string;
    servicio_id?: string;
    empleada_id?: string;
    estado?: any;
  };

  const where: any = {};

  // Scope a la empresa del tenant
  if (req.empresa?.id) {
    where.empresaId = req.empresa.id;
  }

  // Filtro por rango de fechas o fecha exacta
  if (fecha_inicio && fecha_fin) {
    where.fecha = {
      gte: new Date(fecha_inicio),
      lte: new Date(fecha_fin),
    };
  } else if (fecha_inicio) {
    where.fecha = {
      gte: new Date(fecha_inicio),
    };
  } else if (fecha_fin) {
    where.fecha = {
      lte: new Date(fecha_fin),
    };
  } else if (fecha) {
    where.fecha = new Date(fecha);
  }

  // Filtro por servicio
  if (servicio_id) {
    where.servicioId = servicio_id;
  }

  // Filtro por estilista asignada
  if (empleada_id) {
    where.empleadaId = empleada_id;
  }

  // Filtro por estado
  if (estado) {
    where.estado = estado;
  }

  // Filtro por cliente (nombre, teléfono o correo)
  if (cliente && cliente.trim()) {
    const term = cliente.trim();
    where.cliente = {
      OR: [
        { nombre: { contains: term, mode: 'insensitive' } },
        { telefono: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    };
  }

  const reservas = await prisma.reserva.findMany({
    where,
    include: { cliente: true, servicio: true, diseno: true, empleada: true },
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
adminReservaRouter.get('/reportes/ocupacion', async (req, res) => {
  const whereEmpresa = req.empresa?.id ? { empresaId: req.empresa.id } : {};
  const total = await prisma.reserva.count({ where: whereEmpresa });
  const porEstado = await prisma.reserva.groupBy({
    by: ['estado'],
    where: whereEmpresa,
    _count: true,
  });
  res.json({ total, por_estado: porEstado });
});
