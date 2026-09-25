import axios from 'axios';

const apiKey = process.env.WHATSAPP_PROVIDER_API_KEY;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Envío vía WhatsApp Business API (Meta Cloud API).
 * Usa plantillas pre-aprobadas para mensajes fuera de conversación (recordatorios).
 * Si no hay credenciales configuradas, simula el envío (útil para desarrollo local).
 */
export async function enviarWhatsapp(telefono: string, texto: string) {
  if (!apiKey || !phoneNumberId) {
    console.log(`[whatsapp:simulado] Para: ${telefono} | ${texto}`);
    return { estado: 'enviado', simulado: true };
  }

  await axios.post(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: { body: texto },
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return { estado: 'enviado' };
}
