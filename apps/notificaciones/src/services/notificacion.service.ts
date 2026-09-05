import { enviarEmail } from '../channels/email.provider';
import { enviarWhatsapp } from '../channels/whatsapp.provider';
import { textoPorTipo } from '../templates/mensajes';

interface EnviarInput {
  cliente: { nombre: string; telefono: string; email?: string };
  canal: 'email' | 'whatsapp' | 'ambos';
  tipo: string;
  datos_cita: { fecha: string; hora: string; servicio: string };
}

const ASUNTOS: Record<string, string> = {
  confirmacion_reserva: 'Confirmación de tu reserva',
  recordatorio_24h: 'Recordatorio: tu cita es mañana',
  recordatorio_2h: 'Recordatorio: tu cita es hoy',
};

export async function procesarEnvio(input: EnviarInput) {
  const texto = textoPorTipo(input.tipo, input.cliente.nombre, input.datos_cita);
  const resultados: Record<string, any> = {};

  if ((input.canal === 'email' || input.canal === 'ambos') && input.cliente.email) {
    resultados.email = await enviarEmail(
      input.cliente.email,
      ASUNTOS[input.tipo] || 'Notificación de tu cita',
      texto
    );
  }

  if (input.canal === 'whatsapp' || input.canal === 'ambos') {
    resultados.whatsapp = await enviarWhatsapp(input.cliente.telefono, texto);
  }

  return resultados;
}
