import { prisma } from '../../config/database';

/**
 * Convierte "HH:mm" a minutos desde medianoche
 */
function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos: number): string {
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
 * Calcula los bloques de horario disponibles para una fecha y servicio dados,
 * respetando los días laborales, turnos estacionales (feb-oct vs nov-dic),
 * pausas de almuerzo (ej. 12:00 a 13:00) y reservas del salón específico.
 */
export async function calcularDisponibilidad(fecha: string, servicioId: string, empresaId?: string) {
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

  // 1. Validar si el día de la semana corresponde a los días de atención del salón
  const [year, month, day] = fecha.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const diaSemanaIndex = dateObj.getDay();
  const diaNombreNormalizado = DIAS_SEMANA[diaSemanaIndex];

  if (config?.diasAtencion && Array.isArray(config.diasAtencion) && config.diasAtencion.length > 0) {
    const atiendeHoy = config.diasAtencion.some(
      (d: string) => normalizarTexto(d) === diaNombreNormalizado
    );
    if (!atiendeHoy) {
      return []; // Salón cerrado este día
    }
  }

  // 2. Resolver los turnos de atención para la fecha dada (soporta temporadas y pausa de almuerzo)
  let turnos: Array<{ inicio: string; fin: string }> = [];

  const personalizacion =
    (typeof config?.personalizacion === 'string'
      ? JSON.parse(config.personalizacion)
      : config?.personalizacion) || {};

  // Temporadas estacionales (ej. feb-oct vs nov-dic)
  if (
    personalizacion.horarioEstacional?.activo &&
    Array.isArray(personalizacion.horarioEstacional.temporadas)
  ) {
    const temporada = personalizacion.horarioEstacional.temporadas.find(
      (t: any) => Array.isArray(t.meses) && t.meses.includes(month)
    );
    if (temporada && Array.isArray(temporada.turnos) && temporada.turnos.length > 0) {
      turnos = temporada.turnos;
    }
  }

  // Turnos preconfigurados directamente
  if (turnos.length === 0 && Array.isArray(personalizacion.turnos) && personalizacion.turnos.length > 0) {
    turnos = personalizacion.turnos;
  }

  // Pausa de almuerzo explícita sobre horario general
  if (
    turnos.length === 0 &&
    personalizacion.pausaAlmuerzo?.inicio &&
    personalizacion.pausaAlmuerzo?.fin
  ) {
    const horaApertura = config?.horarioApertura || '09:00';
    const horaCierre = config?.horarioCierre || '18:00';
    turnos = [
      { inicio: horaApertura, fin: personalizacion.pausaAlmuerzo.inicio },
      { inicio: personalizacion.pausaAlmuerzo.fin, fin: horaCierre },
    ];
  }

  // Fallback continuo a horario tradicional de apertura y cierre
  if (turnos.length === 0) {
    turnos = [
      {
        inicio: config?.horarioApertura || '09:00',
        fin: config?.horarioCierre || '18:00',
      },
    ];
  }

  // 3. Consultar reservas existentes para el salón en la fecha especificada
  const whereReservas: any = {
    fecha: new Date(fecha),
    estado: { in: ['pendiente', 'confirmada'] },
  };
  if (resolvedEmpresaId) {
    whereReservas.empresaId = resolvedEmpresaId;
  }

  const reservasDelDia = await prisma.reserva.findMany({
    where: whereReservas,
  });

  const ocupados = reservasDelDia.map((r) => ({
    inicio: aMinutos(r.horaInicio),
    fin: aMinutos(r.horaFin),
  }));

  const bloque = config?.duracionBloqueMinutos || 30;
  const duracionServicio = servicio.duracionMinutos;
  const disponibles: string[] = [];

  // 4. Generar slots independientes dentro de cada turno (respetando pausas de almuerzo y límites)
  for (const turno of turnos) {
    const inicioTurno = aMinutos(turno.inicio);
    const finTurno = aMinutos(turno.fin);

    for (let inicio = inicioTurno; inicio + duracionServicio <= finTurno; inicio += bloque) {
      const fin = inicio + duracionServicio;
      const seSolapa = ocupados.some((o) => inicio < o.fin && fin > o.inicio);
      if (!seSolapa) {
        disponibles.push(aHora(inicio));
      }
    }
  }

  return disponibles;
}

export function calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
  return aHora(aMinutos(horaInicio) + duracionMinutos);
}
