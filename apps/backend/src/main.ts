import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter, adminRouter } from './routes';
import { requiereAutenticacion } from './middlewares/auth.middleware';
import { iniciarCronRecordatorios } from './jobs/recordatorios.cron';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', apiRouter);
app.use('/api/admin', requiereAutenticacion, adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
  iniciarCronRecordatorios();
});
