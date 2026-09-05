import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, User, LogOut, Scissors, Clock } from 'lucide-react';
import { Usuario } from '../../types';
import { obtenerUsuarioActual, cerrarSesion } from '../../services/api';
import { GoogleLoginModal } from '../auth/GoogleLoginModal';

export function Navbar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modalAuthAbierto, setModalAuthAbierto] = useState(false);
  const [rolAuthInicial, setRolAuthInicial] = useState<'cliente' | 'estilista'>('cliente');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setUsuario(obtenerUsuarioActual());
  }, [location.pathname]);

  const handleLogout = () => {
    cerrarSesion();
    setUsuario(null);
    setMenuAbierto(false);
    window.location.href = '/';
  };

  const abrirLogin = (rol: 'cliente' | 'estilista') => {
    setRolAuthInicial(rol);
    setModalAuthAbierto(true);
  };

  return (
    <>
      <header className="navbar-container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">
              <Sparkles size={20} />
            </span>
            <div className="brand-text">
              <span className="brand-title">Belle Slot</span>
              <span className="brand-subtitle">Nail Bar & Studio</span>
            </div>
          </Link>

          <nav className="navbar-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Calendar size={17} />
              <span>Reservar Cita</span>
            </Link>

            <Link
              to="/estilistas"
              className={`nav-link ${location.pathname === '/estilistas' ? 'active' : ''}`}
            >
              <Scissors size={17} />
              <span>Agenda Estilistas</span>
            </Link>

            <Link
              to="/mis-citas"
              className={`nav-link ${location.pathname === '/mis-citas' ? 'active' : ''}`}
            >
              <Clock size={17} />
              <span>Mis Citas</span>
            </Link>
          </nav>

          <div className="navbar-auth">
            {usuario ? (
              <div className="user-profile-menu">
                <button
                  type="button"
                  className="user-pill-btn"
                  onClick={() => setMenuAbierto(!menuAbierto)}
                >
                  {usuario.foto ? (
                    <img src={usuario.foto} alt={usuario.nombre} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <User size={16} />
                    </div>
                  )}
                  <div className="user-info-text">
                    <span className="user-name">{usuario.nombre.split(' ')[0]}</span>
                    <span className="user-role-badge">
                      {usuario.rol === 'estilista' ? 'Estilista' : usuario.rol === 'admin' ? 'Admin' : 'Clienta'}
                    </span>
                  </div>
                </button>

                {menuAbierto && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{usuario.nombre}</strong>
                      <span className="dropdown-email">{usuario.email || 'Google User'}</span>
                    </div>
                    <hr />
                    {usuario.rol === 'estilista' && (
                      <Link
                        to="/estilistas"
                        className="dropdown-item"
                        onClick={() => setMenuAbierto(false)}
                      >
                        <Scissors size={15} /> Ver mi agenda
                      </Link>
                    )}
                    <Link
                      to="/mis-citas"
                      className="dropdown-item"
                      onClick={() => setMenuAbierto(false)}
                    >
                      <Clock size={15} /> Mis citas agendadas
                    </Link>
                    <button type="button" className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <button
                  type="button"
                  className="btn-google-login-nav"
                  onClick={() => abrirLogin('cliente')}
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
                  <span>Acceso Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {modalAuthAbierto && (
        <GoogleLoginModal
          rolInicial={rolAuthInicial}
          onCerrar={() => setModalAuthAbierto(false)}
          onLoginExitoso={(u) => {
            setUsuario(u);
            setModalAuthAbierto(false);
          }}
        />
      )}
    </>
  );
}

