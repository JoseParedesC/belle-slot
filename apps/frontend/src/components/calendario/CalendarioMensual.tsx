import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface Props {
  diaSeleccionado?: string; // YYYY-MM-DD
  onSeleccionarDia: (fechaStr: string) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function formatearFechaISO(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

export function CalendarioMensual({ diaSeleccionado, onSeleccionarDia }: Props) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const hoyStr = `${hoy.getFullYear()}-${padZero(hoy.getMonth() + 1)}-${padZero(hoy.getDate())}`;

  const [fechaActual, setFechaActual] = useState(new Date());

  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();

  // Primer día del mes
  const primerDiaMes = new Date(year, month, 1);
  // Días totales en el mes
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  // Días en el mes anterior
  const diasEnMesAnterior = new Date(year, month, 0).getDate();

  // Día de la semana del primer día (0 = Domingo, 1 = Lunes, ...)
  // Convertir para que Lunes sea 0 y Domingo sea 6
  let primerDiaSemana = primerDiaMes.getDay() - 1;
  if (primerDiaSemana === -1) primerDiaSemana = 6;

  // Navegación
  const irMesAnterior = () => {
    setFechaActual(new Date(year, month - 1, 1));
  };

  const irMesSiguiente = () => {
    setFechaActual(new Date(year, month + 1, 1));
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  // Construir celdas del calendario
  const celdas = [];

  // Días previos para rellenar la primera semana
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const diaNum = diasEnMesAnterior - i;
    const mesAnt = month === 0 ? 11 : month - 1;
    const anioAnt = month === 0 ? year - 1 : year;
    const fechaStr = formatearFechaISO(anioAnt, mesAnt, diaNum);
    const fechaObj = new Date(anioAnt, mesAnt, diaNum);

    celdas.push({
      diaNum,
      fechaStr,
      esMesActual: false,
      esHoy: fechaStr === hoyStr,
      esPasado: fechaObj < hoy,
    });
  }

  // Días del mes actual
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = formatearFechaISO(year, month, d);
    const fechaObj = new Date(year, month, d);

    celdas.push({
      diaNum: d,
      fechaStr,
      esMesActual: true,
      esHoy: fechaStr === hoyStr,
      esPasado: fechaObj < hoy,
    });
  }

  // Días del mes siguiente para completar cuadrícula (35 o 42 celdas)
  const totalCeldas = celdas.length <= 35 ? 35 : 42;
  const faltantes = totalCeldas - celdas.length;

  for (let n = 1; n <= faltantes; n++) {
    const mesSig = month === 11 ? 0 : month + 1;
    const anioSig = month === 11 ? year + 1 : year;
    const fechaStr = formatearFechaISO(anioSig, mesSig, n);
    const fechaObj = new Date(anioSig, mesSig, n);

    celdas.push({
      diaNum: n,
      fechaStr,
      esMesActual: false,
      esHoy: fechaStr === hoyStr,
      esPasado: fechaObj < hoy,
    });
  }

  return (
    <div className="calendario-mensual-card">
      <div className="calendario-header-bar">
        <div className="calendario-title-area">
          <div className="calendario-icon-tag">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="calendario-mes-titulo">
              {MESES[month]} <span className="calendario-year">{year}</span>
            </h2>
            <p className="calendario-hint">
              Selecciona un día para abrir el asistente de reserva
            </p>
          </div>
        </div>

        <div className="calendario-controles">
          <button
            type="button"
            className="btn-calendario-nav hoy"
            onClick={irAHoy}
            title="Ir a hoy"
          >
            Hoy
          </button>
          <div className="nav-buttons-pair">
            <button
              type="button"
              className="btn-calendario-nav prev"
              onClick={irMesAnterior}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="btn-calendario-nav next"
              onClick={irMesSiguiente}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="calendario-grid-container">
        {/* Cabecera de días de la semana */}
        <div className="calendario-dias-semana-header">
          {DIAS_SEMANA.map((dia, idx) => (
            <div key={dia} className={`dia-columna-nombre ${idx >= 5 ? 'fin-de-semana' : ''}`}>
              {dia}
            </div>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="calendario-grid-dias">
          {celdas.map((c, index) => {
            const estaSeleccionado = diaSeleccionado === c.fechaStr;
            const deshabilitado = c.esPasado;

            let claseCelda = 'calendario-dia-celda';
            if (!c.esMesActual) claseCelda += ' dia-otro-mes';
            if (c.esHoy) claseCelda += ' dia-hoy';
            if (estaSeleccionado) claseCelda += ' dia-seleccionado';
            if (deshabilitado) claseCelda += ' dia-deshabilitado';
            else claseCelda += ' dia-disponible';

            return (
              <div
                key={`${c.fechaStr}-${index}`}
                className={claseCelda}
                onClick={() => {
                  if (!deshabilitado) {
                    onSeleccionarDia(c.fechaStr);
                  }
                }}
                role="button"
                tabIndex={deshabilitado ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !deshabilitado) {
                    onSeleccionarDia(c.fechaStr);
                  }
                }}
              >
                <div className="dia-celda-top">
                  <span className="dia-numero">{c.diaNum}</span>
                  {c.esHoy && <span className="badge-hoy">Hoy</span>}
                </div>

                <div className="dia-celda-bottom">
                  {!deshabilitado ? (
                    <span className="dia-status-pill">
                      <Sparkles size={11} /> Agendar
                    </span>
                  ) : (
                    <span className="dia-bloqueado-label">No disponible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendario-footer-legend">
        <div className="legend-item">
          <span className="legend-dot disponible" />
          <span>Disponible para reservar</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot hoy" />
          <span>Día de hoy</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bloqueado" />
          <span>Fecha pasada</span>
        </div>
      </div>
    </div>
  );
}

