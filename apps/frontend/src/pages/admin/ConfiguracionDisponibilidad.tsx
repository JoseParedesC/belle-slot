import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LogOut,
  Clock,
  CalendarDays,
  Plus,
  Trash2,
  Save,
  Sun,
  CheckCircle2,
} from 'lucide-react';
import {
  obtenerConfiguracionAdmin,
  actualizarConfiguracionAdmin,
  cerrarSesion,
} from '../../services/api';

interface Turno {
  inicio: string;
  fin: string;
}

interface Temporada {
  nombre: string;
  meses: number[];
  turnos: Turno[];
}

const DIAS_SEMANA_OPCIONES = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];

const MESES_OPCIONES = [
  { valor: 1, label: 'Ene' }, { valor: 2, label: 'Feb' }, { valor: 3, label: 'Mar' },
  { valor: 4, label: 'Abr' }, { valor: 5, label: 'May' }, { valor: 6, label: 'Jun' },
  { valor: 7, label: 'Jul' }, { valor: 8, label: 'Ago' }, { valor: 9, label: 'Sep' },
  { valor: 10, label: 'Oct' }, { valor: 11, label: 'Nov' }, { valor: 12, label: 'Dic' },
];

function nuevaTemporadaVacia(): Temporada {
  return { nombre: '', meses: [], turnos: [{ inicio: '09:00', fin: '18:00' }] };
}

export function ConfiguracionDisponibilidad() {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [horarioApertura, setHorarioApertura] = useState('09:00');
  const [horarioCierre, setHorarioCierre] = useState('18:00');
  const [duracionBloqueMinutos, setDuracionBloqueMinutos] = useState(30);
  const [horasAnticipacionCancelacion, setHorasAnticipacionCancelacion] = useState(12);

  const [horarioEstacionalActivo, setHorarioEstacionalActivo] = useState(false);
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [personalizacionOriginal, setPersonalizacionOriginal] = useState<any>({});

  useEffect(() => {
    obtenerConfiguracionAdmin()
      .then((data: any) => {
        setDiasAtencion(data.diasAtencion || []);
        setHorarioApertura(data.horarioApertura || '09:00');
        setHorarioCierre(data.horarioCierre || '18:00');
        setDuracionBloqueMinutos(data.duracionBloqueMinutos || 30);
        setHorasAnticipacionCancelacion(data.horasAnticipacionCancelacion ?? 12);

        const personalizacion = data.personalizacion || {};
        setPersonalizacionOriginal(personalizacion);

        const estacional = personalizacion.horarioEstacional;
        if (estacional) {
          setHorarioEstacionalActivo(!!estacional.activo);
          setTemporadas(Array.isArray(estacional.temporadas) ? estacional.temporadas : []);
        }
      })
      .catch((err) => {
        console.error('Error al cargar configuración:', err);
        setError('No se pudo cargar la configuración actual.');
      })
      .finally(() => setCargando(false));
  }, []);

  const toggleDia = (dia: string) => {
    setDiasAtencion((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const toggleMesEnTemporada = (temporadaIdx: number, mes: number) => {
    setTemporadas((prev) =>
      prev.map((t, i) => {
        if (i !== temporadaIdx) return t;
        const yaEsta = t.meses.includes(mes);
        return {
          ...t,
          meses: yaEsta ? t.meses.filter((m) => m !== mes) : [...t.meses, mes].sort((a, b) => a - b),
        };
      })
    );
  };

  const actualizarTurno = (temporadaIdx: number, turnoIdx: number, campo: keyof Turno, valor: string) => {
    setTemporadas((prev) =>
      prev.map((t, i) => {
        if (i !== temporadaIdx) return t;
        const nuevosTurnos = t.turnos.map((turno, j) =>
          j === turnoIdx ? { ...turno, [campo]: valor } : turno
        );
        return { ...t, turnos: nuevosTurnos };
      })
    );
  };

  const agregarTurno = (temporadaIdx: number) => {
    setTemporadas((prev) =>
      prev.map((t, i) =>
        i === temporadaIdx ? { ...t, turnos: [...t.turnos, { inicio: '09:00', fin: '18:00' }] } : t
      )
    );
  };

  const quitarTurno = (temporadaIdx: number, turnoIdx: number) => {
    setTemporadas((prev) =>
      prev.map((t, i) =>
        i === temporadaIdx ? { ...t, turnos: t.turnos.filter((_, j) => j !== turnoIdx) } : t
      )
    );
  };

  const actualizarNombreTemporada = (temporadaIdx: number, nombre: string) => {
    setTemporadas((prev) => prev.map((t, i) => (i === temporadaIdx ? { ...t, nombre } : t)));
  };

  const agregarTemporada = () => {
    setTemporadas((prev) => [...prev, nuevaTemporadaVacia()]);
  };

  const quitarTemporada = (temporadaIdx: number) => {
    setTemporadas((prev) => prev.filter((_, i) => i !== temporadaIdx));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    setExito(false);
    try {
      await actualizarConfiguracionAdmin({
        horarioApertura,
        horarioCierre,
        diasAtencion,
        duracionBloqueMinutos: Number(duracionBloqueMinutos),
        horasAnticipacionCancelacion: Number(horasAnticipacionCancelacion),
        personalizacion: {
          ...personalizacionOriginal,
          horarioEstacional: {
            activo: horarioEstacionalActivo,
            temporadas,
          },
        },
      });
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err: any) {
      console.error('Error al guardar configuración:', err);
      setError(err?.response?.data?.error || 'No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-dashboard-layout">
        <div className="admin-container">
          <div className="loading-state">
            <div className="spinner-mini" />
            <span>Cargando configuración de disponibilidad...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-container">
        <div className="admin-header-bar">
          <div>
            <div className="modal-badge">
              <Sparkles size={16} /> Panel de Administración
            </div>
            <h1 className="admin-title">Configuración de Disponibilidad</h1>
          </div>

          <div className="admin-header-actions">
            <Link to="/admin/calendario" className="btn-secondary">
              Volver a la Agenda
            </Link>
            <button
              type="button"
              className="btn-danger-outline"
              onClick={() => {
                cerrarSesion();
                navigate('/admin/login');
              }}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {exito && (
          <div className="banner-aviso-precio" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
            <CheckCircle2 size={18} />
            <span>Configuración guardada con éxito.</span>
          </div>
        )}

        {/* Días de atención */}
        <div className="admin-advanced-filters-card">
          <div className="filters-header-row">
            <div className="filters-title">
              <CalendarDays size={18} className="text-accent" />
              <strong>Días de atención</strong>
            </div>
          </div>
          <p className="toolbar-subtext">
            Los días no seleccionados aparecerán como "Cerrado" en el calendario de reservas.
          </p>
          <div className="horarios-chips-grid" style={{ marginTop: '0.75rem' }}>
            {DIAS_SEMANA_OPCIONES.map((dia) => (
              <button
                key={dia}
                type="button"
                className={`btn-horario-chip ${diasAtencion.includes(dia) ? 'activo' : ''}`}
                onClick={() => toggleDia(dia)}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>

        {/* Horario general y reglas de reserva */}
        <div className="admin-advanced-filters-card">
          <div className="filters-header-row">
            <div className="filters-title">
              <Clock size={18} className="text-accent" />
              <strong>Horario general (por defecto)</strong>
            </div>
          </div>
          <p className="toolbar-subtext">
            Se usa cuando no hay una temporada estacional activa para el mes en curso.
          </p>
          <div className="form-fields-grid" style={{ marginTop: '0.75rem' }}>
            <div className="form-group">
              <label>Hora de apertura</label>
              <input
                type="time"
                className="styled-select"
                value={horarioApertura}
                onChange={(e) => setHorarioApertura(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Hora de cierre</label>
              <input
                type="time"
                className="styled-select"
                value={horarioCierre}
                onChange={(e) => setHorarioCierre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Duración de cada bloque (minutos)</label>
              <input
                type="number"
                min={5}
                step={5}
                className="styled-select"
                value={duracionBloqueMinutos}
                onChange={(e) => setDuracionBloqueMinutos(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Horas mínimas de anticipación para cancelar</label>
              <input
                type="number"
                min={0}
                className="styled-select"
                value={horasAnticipacionCancelacion}
                onChange={(e) => setHorasAnticipacionCancelacion(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Horarios por temporada */}
        <div className="admin-advanced-filters-card">
          <div className="filters-header-row">
            <div className="filters-title">
              <Sun size={18} className="text-accent" />
              <strong>Horarios por temporada</strong>
            </div>
            <button
              type="button"
              className={`btn-horario-chip ${horarioEstacionalActivo ? 'activo' : ''}`}
              onClick={() => setHorarioEstacionalActivo((v) => !v)}
            >
              {horarioEstacionalActivo ? 'Activado' : 'Desactivado'}
            </button>
          </div>
          <p className="toolbar-subtext">
            Define turnos distintos según el mes del año (ej. horario extendido en temporada alta,
            pausa de almuerzo, etc.). Si un mes no cae en ninguna temporada, se usa el horario general de arriba.
          </p>

          {horarioEstacionalActivo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              {temporadas.map((temporada, tIdx) => (
                <div key={tIdx} className="servicio-option-card activo" style={{ cursor: 'default' }}>
                  <div className="card-top-row">
                    <input
                      type="text"
                      value={temporada.nombre}
                      onChange={(e) => actualizarNombreTemporada(tIdx, e.target.value)}
                      placeholder="Nombre de la temporada (ej. Nov-Dic)"
                      className="styled-select"
                      style={{ fontWeight: 700, maxWidth: '260px' }}
                    />
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => quitarTemporada(tIdx)}
                      title="Eliminar temporada"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p className="section-subtext" style={{ marginTop: '0.5rem' }}>Meses que incluye</p>
                  <div className="horarios-chips-grid">
                    {MESES_OPCIONES.map((m) => (
                      <button
                        key={m.valor}
                        type="button"
                        className={`btn-horario-chip ${temporada.meses.includes(m.valor) ? 'activo' : ''}`}
                        onClick={() => toggleMesEnTemporada(tIdx, m.valor)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <p className="section-subtext" style={{ marginTop: '0.75rem' }}>Turnos de atención</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {temporada.turnos.map((turno, turnoIdx) => (
                      <div key={turnoIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="time"
                          className="styled-select"
                          value={turno.inicio}
                          onChange={(e) => actualizarTurno(tIdx, turnoIdx, 'inicio', e.target.value)}
                        />
                        <span>a</span>
                        <input
                          type="time"
                          className="styled-select"
                          value={turno.fin}
                          onChange={(e) => actualizarTurno(tIdx, turnoIdx, 'fin', e.target.value)}
                        />
                        {temporada.turnos.length > 1 && (
                          <button
                            type="button"
                            className="btn-danger-outline"
                            onClick={() => quitarTurno(tIdx, turnoIdx)}
                            title="Eliminar turno"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => agregarTurno(tIdx)}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <Plus size={14} /> Agregar turno (ej. tras pausa de almuerzo)
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-secondary" onClick={agregarTemporada} style={{ alignSelf: 'flex-start' }}>
                <Plus size={16} /> Agregar temporada
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn-primary-action" onClick={handleGuardar} disabled={guardando}>
            <Save size={16} />
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
