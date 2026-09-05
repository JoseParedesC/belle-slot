import { Router } from 'express';
import { servicioRouter } from '../modules/servicios/servicio.controller';
import { disenoRouter } from '../modules/disenos/diseno.controller';
import { clienteRouter } from '../modules/clientes/cliente.controller';
import { reservaRouter, adminReservaRouter } from '../modules/reservas/reserva.controller';
import { configuracionRouter } from '../modules/configuracion/configuracion.controller';
import { authRouter, adminEstilistasRouter } from '../modules/auth/auth.controller';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/disenos', disenoRouter);
apiRouter.use('/clientes', clienteRouter);
apiRouter.use('/configuracion', configuracionRouter);
apiRouter.use('/', reservaRouter); // expone /disponibilidad y /reservas

export const adminRouter = Router();
adminRouter.use('/', adminReservaRouter);
adminRouter.use('/clientes', clienteRouter);
adminRouter.use('/estilistas', adminEstilistasRouter);
