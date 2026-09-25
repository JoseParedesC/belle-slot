import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { login } from '../../services/api';

export function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(usuario, password);
      navigate('/admin/calendario');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="admin-login-layout">
      <div className="admin-login-card">
        <Link to="/" className="back-to-home-link">
          <ArrowLeft size={16} /> Volver al sitio
        </Link>

        <div className="login-header">
          <div className="modal-badge">
            <Sparkles size={16} /> Belle Slot Studio
          </div>
          <h1 className="login-title">Acceso de Administración</h1>
          <p className="login-subtitle">Ingresa tus credenciales para acceder al panel de control</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                placeholder="Nombre de usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-action full-width" disabled={cargando}>
            <span>{cargando ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer-hint">
          <span>¿Eres estilista? </span>
          <Link to="/estilistas" className="link-highlight">
            Ingresa al portal con Google
          </Link>
        </div>
      </div>
    </div>
  );
}
