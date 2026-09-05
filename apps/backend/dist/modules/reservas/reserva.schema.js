"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearReservaSchema = void 0;
const zod_1 = require("zod");
exports.crearReservaSchema = zod_1.z.object({
    cliente: zod_1.z.object({
        nombre: zod_1.z.string().min(2, 'El nombre es requerido'),
        telefono: zod_1.z.string().min(7, 'Teléfono inválido'),
        email: zod_1.z.string().email().optional(),
    }),
    servicio_id: zod_1.z.string().uuid('servicio_id inválido'),
    diseno_id: zod_1.z.string().uuid('diseno_id inválido').optional(),
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
    hora_inicio: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'hora_inicio debe tener formato HH:mm'),
});
