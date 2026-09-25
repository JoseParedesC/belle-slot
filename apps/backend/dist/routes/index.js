"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = exports.apiRouter = void 0;
const express_1 = require("express");
const saas_controller_1 = require("../modules/saas/saas.controller");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const servicio_controller_1 = require("../modules/servicios/servicio.controller");
const diseno_controller_1 = require("../modules/disenos/diseno.controller");
const cliente_controller_1 = require("../modules/clientes/cliente.controller");
const reserva_controller_1 = require("../modules/reservas/reserva.controller");
const configuracion_controller_1 = require("../modules/configuracion/configuracion.controller");
const auth_controller_1 = require("../modules/auth/auth.controller");
exports.apiRouter = (0, express_1.Router)();
// Rutas SaaS globales (directorio de salones, registro de nuevo salón)
exports.apiRouter.use('/saas', saas_controller_1.saasRouter);
// Middleware de resolución de Tenant para todas las operaciones de salón
exports.apiRouter.use(tenant_middleware_1.resolverTenant);
exports.apiRouter.use('/auth', auth_controller_1.authRouter);
exports.apiRouter.use('/servicios', servicio_controller_1.servicioRouter);
exports.apiRouter.use('/disenos', diseno_controller_1.disenoRouter);
exports.apiRouter.use('/clientes', cliente_controller_1.clienteRouter);
exports.apiRouter.use('/configuracion', configuracion_controller_1.configuracionRouter);
exports.apiRouter.use('/', reserva_controller_1.reservaRouter); // expone /disponibilidad y /reservas
exports.adminRouter = (0, express_1.Router)();
// Admin router también resuelve el tenant activo
exports.adminRouter.use(tenant_middleware_1.resolverTenant);
exports.adminRouter.use('/', reserva_controller_1.adminReservaRouter);
exports.adminRouter.use('/clientes', cliente_controller_1.clienteRouter);
exports.adminRouter.use('/estilistas', auth_controller_1.adminEstilistasRouter);
exports.adminRouter.use('/configuracion', configuracion_controller_1.configuracionRouter);
