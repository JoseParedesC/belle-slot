import { prisma } from '../../config/database';
import { calcularDisponibilidad, calcularHoraFin } from './disponibilidad.service';
import { buscarOCrearCliente } from '../clientes/cliente.controller';
import { notificarConfirmacionReserva } from '../notificaciones/notificaciones.client';

interface CrearReservaInput {
  cliente: { nombre: string; telefono: string; email?: string };
  servicioId: string;
  disenoId?: string;
  fecha: string;
  horaInicio: string;
}

export async function crearReserva(input: CrearReservaInput) {
  const { cliente, servicioId, disenoId, fecha, horaInicio } = input;

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) throw new Error('Servicio no encontrado');

  // Revalidar disponibilidad en el servidor (nunca confiar solo en el frontend)
  const disponibles = await calcularDisponibilidad(fecha, servicioId);
  if (!disponibles.includes(horaInicio)) {
    throw new Error('El horario seleccionado ya no está disponible');
  }

  let precioEstimado = Number(servicio.precioBase);
  if (disenoId) {
    const diseno = await prisma.diseno.findUnique({ where: { id: disenoId } });
    if (diseno) precioEstimado += Number(diseno.incrementoPrecio);
  }

  const horaFin = calcularHoraFin(horaInicio, servicio.duracionMinutos);
  const clienteRegistrado = await buscarOCrearCliente(cliente);

  const reserva = await prisma.reserva.create({
    data: {
      clienteId: clienteRegistrado.id,
      servicioId,
      disenoId,
      fecha: new Date(fecha),
      horaInicio,
      horaFin,
      precioEstimado,
      estado: 'pendiente',
    },
  });

  // Disparar notificación de confirmación (no bloquear la respuesta si falla)
  notificarConfirmacionReserva(reserva, clienteRegistrado, servicio).catch((err) =>
    console.error('Error notificando confirmación de reserva:', err.message)
  );

  return reserva;
}

export async function cancelarReserva(id: string, motivo?: string) {
  return prisma.reserva.update({
    where: { id },
    data: { estado: 'cancelada', fechaCancelacion: new Date(), motivoCancelacion: motivo },
  });
}

export async function cambiarEstadoReserva(id: string, estado: 'completada' | 'no_asistio') {
  const reserva = await prisma.reserva.update({ where: { id }, data: { estado } });

  if (estado === 'no_asistio') {
    await prisma.cliente.update({
      where: { id: reserva.clienteId },
      data: { cantidadInasistencias: { increment: 1 } },
    });
  }

  return reserva;
}

export async function obtenerReserva(id: string) {
  return prisma.reserva.findUnique({
    where: { id },
    include: { cliente: true, servicio: true, diseno: true },
  });
}
