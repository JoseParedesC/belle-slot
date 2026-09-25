// Tipos compartidos entre frontend y backend (referencia manual por ahora)
export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio';
export type CanalNotificacion = 'email' | 'whatsapp' | 'ambos';
