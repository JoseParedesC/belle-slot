import { useState, useEffect } from 'react';
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { Usuario, ReservaItem, Empleada } from '../../types';
import {
  obtenerUsuarioActual,
  obtenerReservasAdmin,
  cambiarEstadoReservaAdmin,
  obtenerEstilistas
} from '../../services/api';
import { GoogleLoginModal } from '../../components/auth/GoogleLoginModal';

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function PortalEstilistas() {
  const [usuario, setUsuario] = useState<Usuario | null>(obtenerUsuarioActual());
  const [fecha, setFecha] = useState(hoyISO());
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [estilistas, setEstilistas] = useState<Empleada[]>([]);
  const [estilistaFiltro, setEstilistaFiltro] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [modalAuth, setModalAuth] = useState(false);

  useEffect(() => {
    obtenerEstilistas().then(setEstilistas).catch(console.error);
  }, []);

  useEffect(() => {
    cargarReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, estilistaFiltro]);

  async function cargarReservas() {
    setCargando(true);
    try {
      const data = await obtenerReservasAdmin(fecha, estilistaFiltro || undefined);
      setReservas(data || []);
    } catch (err) {
      console.error('Error al cargar reservas de estilistas:', err);
    } finally {
      setCargando(false);
    }
  }

  const cambiarDia = (offset: number) => {
    const [y, m, d] = fecha.split('-').map(Number);
    const fechaObj = new Date(y, m - 1, d);
    fechaObj.setDate(fechaObj.getDate() + offset);
    setFecha(`${fechaObj.getFullYear()}-${padZero(fechaObj.getMonth() + 1)}-${padZero(fechaObj.getDate())}`);
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: 'completada' | 'no_asistio' | 'cancelada') => {
    try {
      await cambiarEstadoReservaAdmin(id, nuevoEstado);
      cargarReservas();
    } catch (err) {
      alert('No se pudo actualizar el estado de la reserva');
    }
  };

  // Cálculo de estadísticas del día
  const totalCitas = reservas.length;
  const completadas = reservas.filter((r) => r.estado === 'completada').length;
  const ingresosEstimados = reservas.reduce((acc, r) => acc + Number(r.precioEstimado || 0), 0);

  return (
    <div className="portal-estilistas-container">
      {/* Banner Superior / Encabezado */}
      <section className="portal-header-banner">
        <div className="portal-header-left">
          <div className="portal-badge">
            <Scissors size={18} /> Portal de Estilistas
          </div>
          <h1 className="portal-title">Agenda y Gestión de Citas</h1>
          <p className="portal-subtitle">
            Revisa tus clientas asignadas, actualiza el estado de las citas y contáctalas directamente por WhatsApp.
          </p>
        </div>

        <div className="portal-header-right">
          {usuario ? (
            <div className="stylist-user-card">
              <div className="stylist-avatar-wrap">
                {usuario.foto ? (
                  <img src={usuario.foto} alt={usuario.nombre} className="stylist-avatar-img" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="stylist-info">
                <strong>{usuario.nombre}</strong>
                <span className="stylist-status-online">En turno activo</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-google-login-action"
              onClick={() => setModalAuth(true)}
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Acceder con Google</span>
            </button>
          )}
        </div>
      </section>

      {/* Tarjetas de Métricas del Día */}
      <div className="stats-dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap calendar">
            <Calendar size={22} />
          </div>
          <div>
            <span className="stat-label">Citas del Día</span>
            <strong className="stat-value">{totalCitas}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap success">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="stat-label">Completadas</span>
            <strong className="stat-value">{completadas} de {totalCitas}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap money">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="stat-label">Ingresos Estimados</span>
            <strong className="stat-value">${ingresosEstimados.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Barra de Control de Fecha y Filtros */}
      <div className="portal-controls-bar">
        <div className="date-picker-group">
          <button type="button" className="btn-nav-day" onClick={() => cambiarDia(-1)}>
            <ChevronLeft size={18} /> Día anterior
          </button>

          <div className="date-input-wrap">
            <Calendar size={18} className="icon-calendar" />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="styled-date-input"
            />
          </div>

          <button type="button" className="btn-nav-day" onClick={() => cambiarDia(1)}>
            Día siguiente <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="btn-quick-today"
            onClick={() => setFecha(hoyISO())}
          >
            Hoy
          </button>
        </div>

        {estilistas.length > 0 && (
          <div className="stylist-filter-group">
            <Filter size={16} />
            <select
              value={estilistaFiltro}
              onChange={(e) => setEstilistaFiltro(e.target.value)}
              className="styled-select"
            >
              <option value="">Todas las estilistas</option>
              {estilistas.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de Reservas del Día */}
      <div className="reservas-agenda-section">
        {cargando ? (
          <div className="loading-reservas-box">
            <div className="spinner-mini" />
            <span>Cargando citas de la fecha...</span>
          </div>
        ) : reservas.length === 0 ? (
          <div className="empty-reservas-card">
            <Clock size={40} className="empty-icon" />
            <h3>No hay citas programadas para este día</h3>
            <p>Puedes seleccionar otra fecha en los controles superiores o revisar las reservas del mes.</p>
          </div>
        ) : (
          <div className="reservas-cards-stack">
            {reservas.map((reserva) => {
              const telLimpio = reserva.cliente.telefono?.replace(/\D/g, '');
              const whatsappUrl = telLimpio
                ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(
                    `Hola ${reserva.cliente.nombre}, te saludamos de Belle Slot Nail Bar sobre tu cita programada a las ${reserva.horaInicio} hrs.`
                  )}`
                : null;

              return (
                <div key={reserva.id} className={`reserva-agenda-card estado-${reserva.estado}`}>
                  <div className="reserva-hora-badge">
                    <Clock size={16} />
                    <span className="hora-text">{reserva.horaInicio}</span>
                    <span className="hora-fin">- {reserva.horaFin}</span>
                  </div>

                  <div className="reserva-main-details">
                    <div className="client-headline">
                      <h3 className="client-name">{reserva.cliente.nombre}</h3>
                      <span className={`badge-estado-pill ${reserva.estado}`}>
                        {reserva.estado.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="service-and-nailart">
                      <span className="service-title">
                        <Sparkles size={14} className="icon-sparkle" /> {reserva.servicio.nombre}
                      </span>
                      {reserva.diseno && (
                        <span className="diseno-tag">
                          Nail Art: {reserva.diseno.nombre} (+${Number(reserva.diseno.incrementoPrecio).toLocaleString()})
                        </span>
                      )}
                    </div>

                    <div className="client-contact-row">
                      <span className="contact-item">
                        <Phone size={14} /> {reserva.cliente.telefono}
                      </span>
                      {reserva.cliente.email && (
                        <span className="contact-item email">
                          {reserva.cliente.email}
                        </span>
                      )}
                      <span className="price-tag">
                        ${Number(reserva.precioEstimado).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="reserva-actions-column">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp-chat"
                        title="Contactar clienta por WhatsApp"
                      >
                        <MessageCircle size={16} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                      <div className="actions-buttons-pair">
                        <button
                          type="button"
                          className="btn-action-completar"
                          onClick={() => handleCambiarEstado(reserva.id, 'completada')}
                          title="Marcar como atendida"
                        >
                          <CheckCircle2 size={16} />
                          <span>Completada</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action-no-asistio"
                          onClick={() => handleCambiarEstado(reserva.id, 'no_asistio')}
                          title="Marcar como no asistió"
                        >
                          <XCircle size={16} />
                          <span>No asistió</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalAuth && (
        <GoogleLoginModal
          rolInicial="estilista"
          onCerrar={() => setModalAuth(false)}
          onLoginExitoso={(u) => {
            setUsuario(u);
            setModalAuth(false);
            cargarReservas();
          }}
        />
      )}
    </div>
  );
}

