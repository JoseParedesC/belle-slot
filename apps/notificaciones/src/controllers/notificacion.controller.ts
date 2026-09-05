import { Router } from 'express';
import { procesarEnvio } from '../services/notificacion.service';

export const notificacionRouter = Router();

// POST /send-reminder
notificacionRouter.post('/send-reminder', async (req, res) => {
  try {
    const resultado = await procesarEnvio(req.body);
    res.json({ estado_envio: 'enviado', detalle: resultado });
  } catch (err: any) {
    console.error('Error enviando notificación:', err.message);
    res.status(500).json({ estado_envio: 'fallido', error: err.message });
  }
});
