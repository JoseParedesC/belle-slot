import { Router } from 'express';
import { saasRouter } from '../modules/saas/saas.controller';
import { resolverTenant } from '../middlewares/tenant.middleware';
import { servicioRouter } from '../modules/servicios/servicio.controller';
import { disenoRouter } from '../modules/disenos/diseno.controller';
import { clienteRouter } from '../modules/clientes/cliente.controller';
import { reservaRouter, adminReservaRouter } from '../modules/reservas/reserva.controller';
import { configuracionRouter } from '../modules/configuracion/configuracion.controller';
import { authRouter, adminEstilistasRouter } from '../modules/auth/auth.controller';

export const apiRouter = Router();

// Rutas SaaS globales (directorio de salones, registro de nuevo salón)
apiRouter.use('/saas', saasRouter);

// Middleware de resolución de Tenant para todas las operaciones de salón
apiRouter.use(resolverTenant);

apiRouter.use('/auth', authRouter);
apiRouter.use('/servicios', servicioRouter);
apiRouter.use('/disenos', disenoRouter);
apiRouter.use('/clientes', clienteRouter);
apiRouter.use('/configuracion', configuracionRouter);
apiRouter.use('/', reservaRouter); // expone /disponibilidad y /reservas

export const adminRouter = Router();

// Admin router también resuelve el tenant activo
adminRouter.use(resolverTenant);
adminRouter.use('/', adminReservaRouter);
adminRouter.use('/clientes', clienteRouter);
adminRouter.use('/estilistas', adminEstilistasRouter);
adminRouter.use('/configuracion', configuracionRouter);
