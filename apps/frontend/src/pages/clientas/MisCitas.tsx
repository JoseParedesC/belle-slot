import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Sparkles, User, Search, PlusCircle, AlertCircle } from 'lucide-react';
import { ReservaItem, Usuario } from '../../types';
import { obtenerMisReservas, obtenerUsuarioActual } from '../../services/api';
import { GoogleLoginModal } from '../../components/auth/GoogleLoginModal';

export function MisCitas() {
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
  }, [usuario]);

  async function cargarCitas(e?: string, t?: string) {
    const emailQuery = e !== undefined ? e : email;
    const telQuery = t !== undefined ? t : telefono;

    if (!emailQuery && !telQuery) return;

    setCargando(true);
    setBuscado(true);
    try {
      const data = await obtenerMisReservas(emailQuery || undefined, telQuery || undefined);
      setReservas(data || []);
    } catch (err) {
      console.error('Error al consultar mis citas:', err);
    } finally {
      setCargando(false);
    }
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarCitas();
  };

  return (
    <div className="mis-citas-container">
      <div className="mis-citas-header">
        <div className="modal-badge">
          <Calendar size={16} /> Tus Reservas
        </div>
        <h1 className="mis-citas-title">Consulta de Citas</h1>
        <p className="mis-citas-subtitle">
          Revisa el estado de tus citas programadas en Belle Slot Studio
        </p>

        {!usuario && (
          <div className="google-banner-clientas">
            <p>¿Tienes cuenta de Google? Inicia sesión para ver tus citas automáticamente:</p>
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
          </div>
        )}
      </div>

      {/* Formulario de búsqueda si no hay usuario o para buscar con otro email */}
      <form onSubmit={handleBuscar} className="buscar-citas-form">
        <div className="search-fields-group">
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Ingresa tu correo (ej. tu.nombre@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary-action" disabled={cargando}>
            <Search size={16} />
            <span>{cargando ? 'Buscando...' : 'Consultar'}</span>
          </button>
        </div>
      </form>

      {/* Resultados de Citas */}
      <div className="resultados-citas-container">
        {cargando ? (
          <div className="loading-state">
            <div className="spinner-mini" />
            <span>Consultando tus citas...</span>
          </div>
        ) : reservas.length === 0 && buscado ? (
          <div className="empty-citas-box">
            <AlertCircle size={36} />
            <h3>No encontramos citas registradas</h3>
            <p>Verifica el correo ingresado o agenda una nueva cita ahora.</p>
            <Link to="/" className="btn-primary-action link-btn">
              <PlusCircle size={18} />
              <span>Agendar mi Cita</span>
            </Link>
          </div>
        ) : reservas.length > 0 ? (
          <div className="citas-cards-grid">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="cita-cliente-card">
                <div className="cita-card-top">
                  <span className={`badge-estado-pill ${reserva.estado}`}>
                    {reserva.estado}
                  </span>
                  <span className="cita-precio-tag">
                    ${Number(reserva.precioEstimado).toLocaleString()}
                  </span>
                </div>

                <div className="cita-card-body">
                  <h3 className="cita-servicio-titulo">
                    <Sparkles size={16} className="text-accent" />
                    {reserva.servicio.nombre}
                  </h3>

                  {reserva.diseno && (
                    <p className="cita-diseno-txt">
                      Nail Art: <strong>{reserva.diseno.nombre}</strong>
                    </p>
                  )}

                  <div className="cita-fechahora-row">
                    <div className="fecha-pill">
                      <Calendar size={15} />
                      <span>{reserva.fecha.split('T')[0]}</span>
                    </div>
                    <div className="hora-pill">
                      <Clock size={15} />
                      <span>{reserva.horaInicio} - {reserva.horaFin}</span>
                    </div>
                  </div>

                  {reserva.empleada && (
                    <p className="cita-estilista-txt">
                      Atendida por: <strong>{reserva.empleada.nombre}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="citas-cta-agendar">
            <p>¿Aún no tienes una cita agendada?</p>
            <Link to="/" className="btn-primary-action link-btn">
              <PlusCircle size={18} />
              <span>Ir al Calendario y Agendar</span>
            </Link>
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

