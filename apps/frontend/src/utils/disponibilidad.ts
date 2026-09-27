// Días de la semana indexados igual que Date.getDay() (0 = Domingo ... 6 = Sábado),
// en el mismo orden que usa el backend en disponibilidad.service.ts para mantener consistencia.
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function normalizarTexto(txt: string): string {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Determina si la empresa atiende en el día de la semana correspondiente a `fecha`,
 * según el arreglo `diasAtencion` configurado (ej. ["Lunes", "Martes", ...]).
 * Si no hay `diasAtencion` configurado, se asume que atiende todos los días
 * (mismo comportamiento de respaldo que usa el backend).
 */
export function empresaAtiendeEnFecha(diasAtencion: string[] | undefined | null, fecha: Date): boolean {
  if (!diasAtencion || diasAtencion.length === 0) return true;

  const diaNombreNormalizado = DIAS_SEMANA[fecha.getDay()];
  return diasAtencion.some((d) => normalizarTexto(d) === diaNombreNormalizado);
}
