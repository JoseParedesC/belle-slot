import axios from 'axios';
import { prisma } from '../../config/database';

const NOTIFICACIONES_URL = process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3001';

interface EnviarNotificacionInput {
  reserva_id: string;
  cliente: { nombre: string; telefono: string; email?: string | null };
  canal: 'email' | 'whatsapp' | 'ambos';
  tipo: 'confirmacion_reserva' | 'recordatorio_24h' | 'recordatorio_2h';
  datos_cita: { fecha: string; hora: string; servicio: string };
}

async function enviarNotificacion(input: EnviarNotificacionInput) {
  // Determinar qué canales quedarán registrados (uno o dos registros si es "ambos")
  const canalesARegistrar: ('email' | 'whatsapp')[] =
    input.canal === 'ambos' ? ['email', 'whatsapp'] : [input.canal];

  let estadoEnvio: 'enviado' | 'fallido' = 'enviado';

  try {
    await axios.post(`${NOTIFICACIONES_URL}/send-reminder`, input);
  } catch (err) {
    estadoEnvio = 'fallido';
  }

  // Registrar cada intento en la tabla Notificacion, sin bloquear el flujo si falla el registro
  for (const canal of canalesARegistrar) {
    await prisma.notificacion
      .create({
        data: {
          reservaId: input.reserva_id,
          canal,
          tipo: input.tipo,
          estadoEnvio,
          fechaEnvio: estadoEnvio === 'enviado' ? new Date() : null,
        },
      })
      .catch((err) => console.error('Error registrando notificación:', err.message));
  }

  if (estadoEnvio === 'fallido') throw new Error('Fallo el envío de la notificación');
}

export async function notificarConfirmacionReserva(reserva: any, cliente: any, servicio: any) {
  return enviarNotificacion({
    reserva_id: reserva.id,
    cliente: { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email },
    canal: cliente.email ? 'ambos' : 'whatsapp',
    tipo: 'confirmacion_reserva',
    datos_cita: {
      fecha: reserva.fecha.toISOString().split('T')[0],
      hora: reserva.horaInicio,
      servicio: servicio.nombre,
    },
  });
}

export async function notificarRecordatorio(
  reserva: any,
  cliente: any,
  servicio: any,
  tipo: 'recordatorio_24h' | 'recordatorio_2h'
) {
  return enviarNotificacion({
    reserva_id: reserva.id,
    cliente: { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email },
    canal: cliente.email ? 'ambos' : 'whatsapp',
    tipo,
    datos_cita: {
      fecha: reserva.fecha.toISOString().split('T')[0],
      hora: reserva.horaInicio,
      servicio: servicio.nombre,
    },
  });
}
