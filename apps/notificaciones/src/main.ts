import 'dotenv/config';
import express from 'express';
import { notificacionRouter } from './controllers/notificacion.controller';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/', notificacionRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servicio de notificaciones escuchando en puerto ${PORT}`);
});
