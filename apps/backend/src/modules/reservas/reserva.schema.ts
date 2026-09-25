import { z } from 'zod';

export const crearReservaSchema = z.object({
  cliente: z.object({
    nombre: z.string().min(2, 'El nombre es requerido'),
    telefono: z.string().min(7, 'Teléfono inválido'),
    email: z.string().email().optional(),
  }),
  servicio_id: z.string().uuid('servicio_id inválido'),
  diseno_id: z.string().uuid('diseno_id inválido').optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha debe tener formato YYYY-MM-DD'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'hora_inicio debe tener formato HH:mm'),
});
