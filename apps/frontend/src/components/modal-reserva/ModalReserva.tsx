import { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Scissors,
  Check,
  ArrowRight
} from 'lucide-react';
import { Servicio, Diseno, Configuracion, Usuario } from '../../types';
import {
  obtenerDisenos,
  obtenerDisponibilidad,
  crearReserva,
  obtenerConfiguracion,
  obtenerUsuarioActual
} from '../../services/api';
import { BannerAvisoPrecio } from '../banner-aviso-precio/BannerAvisoPrecio';

interface Props {
  fecha: string; // YYYY-MM-DD
  servicios: Servicio[];
  servicioInicial?: Servicio;
  onCerrar: () => void;
  onReservaExitosa?: (reserva: any) => void;
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const NOMBRES_DIAS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

function formatearFechaLegible(fechaStr: string): string {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fechaObj = new Date(y, m - 1, d);
  const diaSemana = NOMBRES_DIAS[fechaObj.getDay()];
  const mesNombre = NOMBRES_MESES[m - 1];
  return `${diaSemana}, ${d} de ${mesNombre} de ${y}`;
}

export function ModalReserva({
  fecha,
  servicios,
  servicioInicial,
  onCerrar,
  onReservaExitosa
}: Props) {
  const [servicio, setServicio] = useState<Servicio | undefined>(servicioInicial || servicios[0]);
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [diseno, setDiseno] = useState<Diseno | undefined>();
  const [horarios, setHorarios] = useState<string[]>([]);
  const [hora, setHora] = useState('');
  const [config, setConfig] = useState<Configuracion | null>(null);

  const usuarioActual: Usuario | null = obtenerUsuarioActual();

  const [nombre, setNombre] = useState(usuarioActual?.nombre || '');
  const [telefono, setTelefono] = useState(usuarioActual?.telefono || '');
  const [email, setEmail] = useState(usuarioActual?.email || '');

  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');
  const [reservaConfirmada, setReservaConfirmada] = useState<any>(null);

  // Escuchar tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  // Cargar configuración de negocio
  useEffect(() => {
    obtenerConfiguracion().then(setConfig).catch(console.error);
  }, []);

  // Cuando cambia el servicio, actualizar diseños
  useEffect(() => {
    if (!servicio) return;
    setDiseno(undefined);
    obtenerDisenos(servicio.id)
      .then(setDisenos)
      .catch(console.error);
  }, [servicio]);

  // Cuando cambia fecha o servicio, cargar horarios disponibles
  useEffect(() => {
    if (!fecha || !servicio) return;
    setCargandoHorarios(true);
    setHora('');
    obtenerDisponibilidad(fecha, servicio.id)
      .then((slots) => setHorarios(slots || []))
      .catch((err) => {
        console.error('Error al cargar horarios:', err);
        setHorarios([]);
      })
      .finally(() => setCargandoHorarios(false));
  }, [fecha, servicio]);

  const precioTotal = (servicio?.precioBase || 0) + (diseno?.incrementoPrecio || 0);

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicio || !fecha || !hora || !nombre.trim() || !telefono.trim()) {
      setError('Por favor completa todos los campos requeridos (servicio, hora, nombre y teléfono).');
      return;
    }

    setConfirmando(true);
    setError('');

    try {
      const res = await crearReserva({
        cliente: {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          email: email.trim() || undefined,
        },
        servicio_id: servicio.id,
        diseno_id: diseno?.id,
        fecha,
        hora_inicio: hora,
      });

      setReservaConfirmada(res);
      if (onReservaExitosa) {
        onReservaExitosa(res);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo completar la reserva. Intenta de nuevo.');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card modal-reserva-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onCerrar}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {reservaConfirmada ? (
          /* Pantalla de Confirmación / Voucher Digital */
          <div className="reserva-voucher-exito">
            <div className="voucher-icon-anim">
              <CheckCircle size={58} className="voucher-check-icon" />
            </div>

            <div className="modal-badge success">
              <Sparkles size={16} /> ¡Cita Reservada con Éxito!
            </div>

            <h2 className="modal-title">¡Te esperamos en {config?.nombreNegocio || 'Belle Slot'}!</h2>
            <p className="voucher-subtitle">
              Hemos registrado tu reserva. Te enviaremos un recordatorio por WhatsApp antes de tu cita.
            </p>

            <div className="voucher-card">
              <div className="voucher-header">
                <span className="voucher-brand">{config?.nombreNegocio || 'Belle Slot Studio'}</span>
                <span className="voucher-badge-estado">Confirmada</span>
              </div>

              <div className="voucher-details-grid">
                <div className="voucher-item">
                  <span className="voucher-label">Fecha</span>
                  <strong className="voucher-value">{formatearFechaLegible(fecha)}</strong>
                </div>

                <div className="voucher-item">
                  <span className="voucher-label">Horario</span>
                  <strong className="voucher-value">{reservaConfirmada.horaInicio || hora} hrs</strong>
                </div>

                <div className="voucher-item">
                  <span className="voucher-label">Tratamiento</span>
                  <strong className="voucher-value">{servicio?.nombre}</strong>
                </div>

                <div className="voucher-item">
                  <span className="voucher-label">Diseño</span>
                  <strong className="voucher-value">{diseno ? diseno.nombre : 'Básico / Estándar'}</strong>
                </div>

                <div className="voucher-item">
                  <span className="voucher-label">Clienta</span>
                  <strong className="voucher-value">{nombre}</strong>
                </div>

                <div className="voucher-item">
                  <span className="voucher-label">Precio Estimado</span>
                  <strong className="voucher-value total">${Number(precioTotal).toLocaleString()}</strong>
                </div>
              </div>

              <div className="voucher-barcode-row">
                <div className="barcode-mock" />
                <span className="voucher-id-text">ID: {reservaConfirmada.id?.substring(0, 8).toUpperCase() || 'BELLE-RES'}</span>
              </div>
            </div>

            <div className="voucher-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setReservaConfirmada(null);
                  setHora('');
                }}
              >
                Agendar otra cita
              </button>

              <button
                type="button"
                className="btn-primary-action"
                onClick={onCerrar}
              >
                Listo, cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Reserva Guiado */
          <form onSubmit={handleConfirmar} className="modal-reserva-content">
            <div className="modal-header">
              <div className="modal-date-badge">
                <CalendarIcon size={16} />
                <span>{formatearFechaLegible(fecha)}</span>
              </div>
              <h2 className="modal-title">Completa tu Reserva</h2>
              <p className="modal-subtitle">
                Personaliza tu servicio, elige la hora disponible e ingresa tus datos
              </p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* PASO 1: Elegir Servicio */}
            <div className="modal-section">
              <div className="section-label-group">
                <span className="step-pill">1</span>
                <div>
                  <h3 className="section-heading">Selecciona tu Servicio</h3>
                  <p className="section-subtext">Elige el cuidado ideal para tus uñas</p>
                </div>
              </div>

              <div className="servicios-cards-grid">
                {servicios.map((s) => {
                  const seleccionado = servicio?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`servicio-option-card ${seleccionado ? 'activo' : ''}`}
                      onClick={() => setServicio(s)}
                    >
                      <div className="card-top-row">
                        <span className="card-title">{s.nombre}</span>
                        {seleccionado && <Check size={18} className="check-icon-active" />}
                      </div>
                      {s.descripcion && <p className="card-description">{s.descripcion}</p>}
                      <div className="card-meta-row">
                        <span className="meta-pill duration">
                          <Clock size={13} /> {s.duracionMinutos} min
                        </span>
                        <span className="meta-pill price">
                          ${Number(s.precioBase).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: Elegir Diseño (si hay diseños disponibles) */}
            {disenos.length > 0 && (
              <div className="modal-section">
                <div className="section-label-group">
                  <span className="step-pill">2</span>
                  <div>
                    <h3 className="section-heading">Diseño o Decoración</h3>
                    <p className="section-subtext">Opciones de nail art para tu estilo</p>
                  </div>
                </div>

                <div className="disenos-cards-grid">
                  <div
                    className={`diseno-option-card ${!diseno ? 'activo' : ''}`}
                    onClick={() => setDiseno(undefined)}
                  >
                    <div className="card-top-row">
                      <span className="card-title">Sin diseño adicional</span>
                      {!diseno && <Check size={16} className="check-icon-active" />}
                    </div>
                    <span className="card-price-tag included">Incluido en base</span>
                  </div>

                  {disenos.map((d) => {
                    const seleccionado = diseno?.id === d.id;
                    return (
                      <div
                        key={d.id}
                        className={`diseno-option-card ${seleccionado ? 'activo' : ''}`}
                        onClick={() => setDiseno(d)}
                      >
                        <div className="card-top-row">
                          <span className="card-title">{d.nombre}</span>
                          {seleccionado && <Check size={16} className="check-icon-active" />}
                        </div>
                        <span className="card-price-tag extra">
                          +${Number(d.incrementoPrecio).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Banner de aviso de precio si aplica */}
            {config?.textoBannerPrecio && (
              <BannerAvisoPrecio texto={config.textoBannerPrecio} />
            )}

            {/* PASO 3: Elegir Horario */}
            <div className="modal-section">
              <div className="section-label-group">
                <span className="step-pill">{disenos.length > 0 ? '3' : '2'}</span>
                <div>
                  <h3 className="section-heading">Horarios Disponibles para este día</h3>
                  <p className="section-subtext">Selecciona la hora de inicio de tu cita</p>
                </div>
              </div>

              {cargandoHorarios ? (
                <div className="horarios-loading-state">
                  <div className="spinner-mini" />
                  <span>Consultando disponibilidad en tiempo real...</span>
                </div>
              ) : horarios.length === 0 ? (
                <div className="horarios-empty-state">
                  <AlertCircle size={24} />
                  <div>
                    <strong>No hay horarios libres para esta fecha</strong>
                    <p>Por favor selecciona otro día en el calendario.</p>
                  </div>
                </div>
              ) : (
                <div className="horarios-chips-grid">
                  {horarios.map((h) => {
                    const seleccionado = hora === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        className={`btn-horario-chip ${seleccionado ? 'activo' : ''}`}
                        onClick={() => setHora(h)}
                      >
                        <Clock size={14} />
                        <span>{h}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PASO 4: Datos del Cliente */}
            <div className="modal-section">
              <div className="section-label-group">
                <span className="step-pill">{disenos.length > 0 ? '4' : '3'}</span>
                <div>
                  <h3 className="section-heading">Tus Datos de Contacto</h3>
                  <p className="section-subtext">Para confirmar y enviarte el recordatorio</p>
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre y Apellido *"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp *"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                <div className="input-with-icon full-width">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Correo electrónico (opcional para confirmación)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Precio y Acción Final */}
            <div className="modal-reserva-footer">
              <div className="resumen-rapido-box">
                <div className="resumen-linea">
                  <span>Tratamiento:</span>
                  <strong>{servicio?.nombre}</strong>
                </div>
                {diseno && (
                  <div className="resumen-linea">
                    <span>Diseño:</span>
                    <strong>{diseno.nombre} (+${Number(diseno.incrementoPrecio).toLocaleString()})</strong>
                  </div>
                )}
                <div className="resumen-total-linea">
                  <span>Total Estimado:</span>
                  <span className="precio-total-badge">${Number(precioTotal).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-action submit-reserva-btn"
                disabled={confirmando || !hora || !nombre.trim() || !telefono.trim()}
              >
                {confirmando ? (
                  <span>Agendando tu cita...</span>
                ) : (
                  <>
                    <span>Confirmar Cita</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

