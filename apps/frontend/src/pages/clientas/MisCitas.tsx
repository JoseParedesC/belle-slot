import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Sparkles, User, Search, PlusCircle, AlertCircle } from 'lucide-react';
import { ReservaItem, Usuario } from '../../types';
import { obtenerMisReservas, obtenerUsuarioActual } from '../../services/api';
import { GoogleLoginModal } from '../../components/auth/GoogleLoginModal';
import { useEmpresa } from '../../context/EmpresaContext';

export function MisCitas() {
  const { empresaActual } = useEmpresa();
  const [usuario, setUsuario] = useState<Usuario | null>(obtenerUsuarioActual());
  const [email, setEmail] = useState(usuario?.email || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [modalAuth, setModalAuth] = useState(false);

  useEffect(() => {
    if (usuario?.email || usuario?.telefono) {
      cargarCitas(usuario.email, usuario.telefono);
    }
  }, [usuario, empresaActual?.id]);

  async function cargarCitas(e?: string, t?: string) {
    const emailQuery = e !== undefined ? e : email;
    const telQuery = t !== undefined ? t : telefono;

    if (!emailQuery && !telQuery) return;

    setCargando(true);
    setBuscado(true);
    try {
      const data = await obtenerMisReservas(emailQuery, telQuery);
      setReservas(data || []);
    } catch (err) {
      console.error('Error al cargar mis citas:', err);
    } finally {
      setCargando(false);
    }
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarCitas();
  };

  const urlReserva = empresaActual ? `/${empresaActual.slug}` : '/';

  return (
    <div className="mis-citas-container">
      <div className="mis-citas-header">
        <div className="modal-badge">
          <Calendar size={16} /> Tus Reservas
        </div>
        <h1 className="mis-citas-title">Consulta de Citas</h1>
        <p className="mis-citas-subtitle">
          Revisa el estado de tus citas programadas en {empresaActual?.nombre || 'Belle Slot Studio'}
        </p>

        {!usuario && (
          <div className="google-banner-clientas">
            <p>¿Tienes cuenta de Google? Inicia sesión para ver tus citas automáticamente:</p>
            <button
              type="button"
              className="btn-google-login-nav"
              onClick={() => setModalAuth(true)}
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="16" height="16">
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
          </div>
        )}

        <form onSubmit={handleBuscar} className="mis-citas-search-card">
          <div className="search-inputs-grid">
            <div className="search-input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="search-input-group">
              <label>Número de WhatsApp / Teléfono</label>
              <input
                type="tel"
                placeholder="300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-search-citas" disabled={cargando}>
            <Search size={16} />
            <span>{cargando ? 'Buscando...' : 'Buscar mis Citas'}</span>
          </button>
        </form>
      </div>

      <div className="mis-citas-results-area">
        {cargando ? (
          <div className="loading-state-box">
            <Clock size={32} className="spinning-icon" />
            <p>Cargando citas registradas...</p>
          </div>
        ) : reservas.length > 0 ? (
          <div className="citas-cards-grid">
            {reservas.map((reserva) => (
              <div key={reserva.id} className={`cita-card estado-${reserva.estado}`}>
                <div className="cita-card-top">
                  <span className={`estado-badge badge-${reserva.estado}`}>
                    {reserva.estado.toUpperCase()}
                  </span>
                  <span className="cita-codigo">Ref: {reserva.id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="cita-service-info">
                  <h3>{reserva.servicio.nombre}</h3>
                  {reserva.diseno && (
                    <span className="diseno-tag">Diseño: {reserva.diseno.nombre}</span>
                  )}
                </div>

                <div className="cita-datetime-info">
                  <div className="dt-row">
                    <Calendar size={15} />
                    <span>
                      {new Date(reserva.fecha).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="dt-row">
                    <Clock size={15} />
                    <span>
                      {reserva.horaInicio} a {reserva.horaFin} hrs
                    </span>
                  </div>
                  {reserva.empleada && (
                    <div className="dt-row">
                      <User size={15} />
                      <span>Atendida por: {reserva.empleada.nombre}</span>
                    </div>
                  )}
                </div>

                <div className="cita-card-bottom">
                  <span className="precio-tag">
                    Total: ${Number(reserva.precioEstimado).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : buscado ? (
          <div className="empty-citas-state">
            <AlertCircle size={44} className="empty-icon" />
            <h3>No encontramos citas asociadas</h3>
            <p>Verifica que el correo o teléfono ingresado sea el mismo utilizado al momento de reservar.</p>
            <Link to={urlReserva} className="btn-agendar-cta">
              <PlusCircle size={16} />
              <span>Agendar una Cita Ahora</span>
            </Link>
          </div>
        ) : (
          <div className="initial-citas-prompt">
            <Sparkles size={40} className="prompt-icon" />
            <p>Ingresa tu correo o teléfono arriba para consultar tu historial y próximas citas.</p>
          </div>
        )}
      </div>

      {modalAuth && (
        <GoogleLoginModal
          rolInicial="cliente"
          onCerrar={() => setModalAuth(false)}
          onLoginExitoso={(u) => {
            setUsuario(u);
            setModalAuth(false);
            if (u.email) {
              setEmail(u.email);
              cargarCitas(u.email, u.telefono);
            }
          }}
        />
      )}
    </div>
  );
}
