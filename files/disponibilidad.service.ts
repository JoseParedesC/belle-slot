import { prisma } from '../../config/database';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Turno {
  inicio: string; // "HH:mm"
  fin: string; // "HH:mm"
}

export type MotivoBloqueo = 'ocupado' | 'pasada';

export interface SlotHorario {
  hora: string; // "HH:mm" (hora de inicio de la cita)
  disponible: boolean;
  motivo?: MotivoBloqueo; // solo presente cuando disponible === false
}

// ---------------------------------------------------------------------------
// Utilidades de tiempo (puras, sin acceso a base de datos)
// ---------------------------------------------------------------------------

/** Convierte "HH:mm" a minutos desde medianoche */
export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** Convierte minutos desde medianoche a "HH:mm" */
export function aHora(minutos: number): string {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function normalizarTexto(txt: string): string {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/**
 * Fecha y hora actuales en la zona horaria del negocio (el servidor en Railway
 * corre en UTC, así que no se puede usar new Date() directamente para comparar
 * contra las horas del salón). Configurable con la variable TIMEZONE_NEGOCIO.
 */
function ahoraEnZonaNegocio(): { fecha: string; minutos: number } {
  const timeZone = process.env.TIMEZONE_NEGOCIO || 'America/Bogota';
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value || '0';
  return {
    fecha: `${get('year')}-${get('month')}-${get('day')}`,
    minutos: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

// ---------------------------------------------------------------------------
// Funciones reutilizables de cálculo (puras)
// ---------------------------------------------------------------------------

/**
 * Determina si el salón atiende el día de la semana de `fecha` (YYYY-MM-DD).
 * Si no hay `diasAtencion` configurado se asume que atiende todos los días.
 */
export function atiendeEnFecha(diasAtencion: unknown, fecha: string): boolean {
  if (!Array.isArray(diasAtencion) || diasAtencion.length === 0) return true;

  const [year, month, day] = fecha.split('-').map(Number);
  const diaNombre = DIAS_SEMANA[new Date(year, month - 1, day).getDay()];
  return diasAtencion.some((d: string) => normalizarTexto(d) === diaNombre);
}

/**
 * Resuelve los turnos de atención (rangos de horas) para un mes dado.
 * Prioridad: temporada estacional > turnos directos > pausa de almuerzo > horario continuo.
 * Cada turno es un rango independiente, por lo que los espacios entre turnos
 * (ej. la hora de almuerzo) nunca generan horas reservables.
 */
export function resolverTurnos(config: any, mes: number): Turno[] {
  const personalizacion =
    (typeof config?.personalizacion === 'string'
      ? JSON.parse(config.personalizacion)
      : config?.personalizacion) || {};

  // 1. Temporadas estacionales
  if (
    personalizacion.horarioEstacional?.activo &&
    Array.isArray(personalizacion.horarioEstacional.temporadas)
  ) {
    const temporada = personalizacion.horarioEstacional.temporadas.find(
      (t: any) => Array.isArray(t.meses) && t.meses.includes(mes)
    );
    if (temporada && Array.isArray(temporada.turnos) && temporada.turnos.length > 0) {
      return temporada.turnos;
    }
  }

  // 2. Turnos preconfigurados directamente
  if (Array.isArray(personalizacion.turnos) && personalizacion.turnos.length > 0) {
    return personalizacion.turnos;
  }

  // 3. Pausa de almuerzo explícita sobre el horario general
  const horaApertura = config?.horarioApertura || '09:00';
  const horaCierre = config?.horarioCierre || '18:00';
  if (personalizacion.pausaAlmuerzo?.inicio && personalizacion.pausaAlmuerzo?.fin) {
    return [
      { inicio: horaApertura, fin: personalizacion.pausaAlmuerzo.inicio },
      { inicio: personalizacion.pausaAlmuerzo.fin, fin: horaCierre },
    ];
  }

  // 4. Horario continuo tradicional
  return [{ inicio: horaApertura, fin: horaCierre }];
}

/**
 * Genera TODAS las horas de inicio posibles dentro de los turnos configurados:
 * una cita que empieza en `inicio` debe terminar (inicio + duración) dentro del mismo turno.
 */
export function generarHorasDeInicio(turnos: Turno[], duracionMinutos: number, bloqueMinutos: number): string[] {
  const horas: string[] = [];
  for (const turno of turnos) {
    const inicioTurno = aMinutos(turno.inicio);
    const finTurno = aMinutos(turno.fin);
    for (let inicio = inicioTurno; inicio + duracionMinutos <= finTurno; inicio += bloqueMinutos) {
      horas.push(aHora(inicio));
    }
  }
  return horas.sort();
}

/**
 * Marca cada hora de inicio como disponible o bloqueada, según las citas ya
 * reservadas (ocupados) y, si aplica, las horas que ya pasaron hoy.
 * Función pura: no consulta la base de datos, por lo que es fácil de probar y reutilizar.
 */
export function marcarBloqueos(
  horas: string[],
  duracionMinutos: number,
  ocupados: Array<{ inicio: number; fin: number }>,
  minutosMinimos?: number // si se indica, las horas anteriores a este valor se marcan como 'pasada'
): SlotHorario[] {
  return horas.map((hora) => {
    const inicio = aMinutos(hora);
    const fin = inicio + duracionMinutos;

    if (minutosMinimos !== undefined && inicio < minutosMinimos) {
      return { hora, disponible: false, motivo: 'pasada' as const };
    }
    if (ocupados.some((o) => inicio < o.fin && fin > o.inicio)) {
      return { hora, disponible: false, motivo: 'ocupado' as const };
    }
    return { hora, disponible: true };
  });
}

// ---------------------------------------------------------------------------
// Funciones con acceso a base de datos
// ---------------------------------------------------------------------------

/**
 * Devuelve TODAS las horas de inicio del día dentro de los rangos configurados,
 * indicando cuáles están disponibles y cuáles bloqueadas (por otra cita o por
 * haber pasado ya). Un día en que el salón no atiende devuelve una lista vacía.
 */
export async function calcularSlotsDelDia(
  fecha: string,
  servicioId: string,
  empresaId?: string
): Promise<SlotHorario[]> {
  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) throw new Error('Servicio no encontrado');

  const resolvedEmpresaId = empresaId || servicio.empresaId;
  let config: any = null;

  if (resolvedEmpresaId) {
    config = await prisma.empresa.findUnique({ where: { id: resolvedEmpresaId } });
  }
  if (!config) {
    config = await prisma.configuracionNegocio.findFirst();
  }

  // Día en que el salón no atiende
  if (!atiendeEnFecha(config?.diasAtencion, fecha)) {
    return [];
  }

  const mes = Number(fecha.split('-')[1]);
  const turnos = resolverTurnos(config, mes);
  const bloque = config?.duracionBloqueMinutos || 30;
  const duracion = servicio.duracionMinutos;

  const horas = generarHorasDeInicio(turnos, duracion, bloque);

  // Citas ya reservadas ese día (las canceladas no bloquean)
  const whereReservas: any = {
    fecha: new Date(fecha),
    estado: { in: ['pendiente', 'confirmada'] },
  };
  if (resolvedEmpresaId) {
    whereReservas.empresaId = resolvedEmpresaId;
  }
  const reservasDelDia = await prisma.reserva.findMany({ where: whereReservas });

  const ocupados = reservasDelDia.map((r) => ({
    inicio: aMinutos(r.horaInicio),
    fin: aMinutos(r.horaFin),
  }));

  // Si la fecha es hoy, las horas que ya pasaron también quedan bloqueadas
  const ahora = ahoraEnZonaNegocio();
  const minutosMinimos = fecha === ahora.fecha ? ahora.minutos : undefined;
  if (fecha < ahora.fecha) {
    return marcarBloqueos(horas, duracion, ocupados, 24 * 60); // fecha pasada: todo bloqueado
  }

  return marcarBloqueos(horas, duracion, ocupados, minutosMinimos);
}

/**
 * Solo las horas de inicio disponibles (string[]). Se mantiene con la misma firma
 * porque reserva.service.ts la usa para revalidar en el servidor antes de crear una cita.
 */
export async function calcularDisponibilidad(fecha: string, servicioId: string, empresaId?: string) {
  const slots = await calcularSlotsDelDia(fecha, servicioId, empresaId);
  return slots.filter((s) => s.disponible).map((s) => s.hora);
}

export function calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
  return aHora(aMinutos(horaInicio) + duracionMinutos);
}
