import cron from 'node-cron';
import { prisma } from '../config/database';
import { notificarRecordatorio } from '../modules/notificaciones/notificaciones.client';

/**
 * Corre cada 15 minutos. Busca reservas próximas (24h y 2h) que aún
 * no tengan su recordatorio enviado, y dispara la notificación.
 */
export function iniciarCronRecordatorios() {
  cron.schedule('*/15 * * * *', async () => {
    await procesarRecordatorios();
  });
}

export async function procesarRecordatorios() {
  const ahora = new Date();

  await procesarVentana(ahora, 24, 'recordatorio24hEnviado', 'recordatorio_24h');
  await procesarVentana(ahora, 2, 'recordatorio2hEnviado', 'recordatorio_2h');
}

async function procesarVentana(
  ahora: Date,
  horasAntes: number,
  campoFlag: 'recordatorio24hEnviado' | 'recordatorio2hEnviado',
  tipo: 'recordatorio_24h' | 'recordatorio_2h'
) {
  const inicioVentana = new Date(ahora.getTime() + (horasAntes - 0.25) * 60 * 60 * 1000);
  const finVentana = new Date(ahora.getTime() + horasAntes * 60 * 60 * 1000);

  const reservas = await prisma.reserva.findMany({
    where: {
      estado: { in: ['pendiente', 'confirmada'] },
      [campoFlag]: false,
      fecha: { gte: inicioVentana, lte: finVentana },
    },
    include: { cliente: true, servicio: true },
  });

  for (const reserva of reservas) {
    try {
      await notificarRecordatorio(reserva, reserva.cliente, reserva.servicio, tipo);
      await prisma.reserva.update({
        where: { id: reserva.id },
        data: { [campoFlag]: true },
      });
    } catch (err) {
      console.error(`Error enviando ${tipo} para reserva ${reserva.id}:`, err);
    }
  }
}
