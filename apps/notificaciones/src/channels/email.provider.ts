import sgMail from '@sendgrid/mail';

const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
if (apiKey) sgMail.setApiKey(apiKey);

export async function enviarEmail(destinatario: string, asunto: string, texto: string) {
  if (!apiKey) {
    console.log(`[email:simulado] Para: ${destinatario} | Asunto: ${asunto} | ${texto}`);
    return { estado: 'enviado', simulado: true };
  }

  await sgMail.send({
    to: destinatario,
    from: process.env.EMAIL_REMITENTE || 'no-reply@tunegocio.com',
    subject: asunto,
    text: texto,
  });

  return { estado: 'enviado' };
}
