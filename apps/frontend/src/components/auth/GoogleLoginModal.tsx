import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Scissors, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { RolUsuario, Usuario } from '../../types';
import { loginConGoogle } from '../../services/api';

interface Props {
  rolInicial?: 'cliente' | 'estilista';
  onCerrar: () => void;
  onLoginExitoso: (usuario: Usuario) => void;
}

export function GoogleLoginModal({ rolInicial = 'cliente', onCerrar, onLoginExitoso }: Props) {
  const [rol, setRol] = useState<'cliente' | 'estilista'>(rolInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [nombreDemo, setNombreDemo] = useState(rol === 'estilista' ? 'Valentina Gómez' : 'Camila Morales');
  const [emailDemo, setEmailDemo] = useState(rol === 'estilista' ? 'valentina.estilista@gmail.com' : 'camila.cliente@gmail.com');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (rol === 'estilista') {
      setNombreDemo('Valentina Gómez');
      setEmailDemo('valentina.estilista@gmail.com');
    } else {
      setNombreDemo('Camila Morales');
      setEmailDemo('camila.cliente@gmail.com');
    }
  }, [rol]);

  useEffect(() => {
    // Si Google Identity Services está cargado y hay un client ID configurado
    if (googleClientId && (window as any).google?.accounts?.id && googleBtnRef.current) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await procesarLogin({ credential: response.credential, rol });
            }
          },
        });
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          locale: 'es',
        });
      } catch (err) {
        console.warn('Error inicializando Google GIS:', err);
      }
    }
  }, [googleClientId, rol]);

  async function procesarLogin(payload: { credential?: string; rol: 'cliente' | 'estilista'; email?: string; nombre?: string }) {
    setCargando(true);
    setError('');
    try {
      const data = await loginConGoogle(payload);
      onLoginExitoso(data.usuario);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al iniciar sesión con Google');
    } finally {
      setCargando(false);
    }
  }

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    procesarLogin({
      rol: rol as 'cliente' | 'estilista',
      nombre: nombreDemo,
      email: emailDemo,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onCerrar}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-badge">
            <Sparkles size={16} /> Belle Slot Studio
          </div>
          <h2 className="modal-title">Iniciar Sesión con Google</h2>
          <p className="modal-subtitle">
            Accede a tu cuenta para gestionar tus citas o tu agenda de trabajo
          </p>
        </div>

        <div className="auth-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${rol === 'cliente' ? 'active' : ''}`}
            onClick={() => setRol('cliente')}
          >
            <UserCheck size={18} />
            <div>
              <strong>Soy Clienta</strong>
              <small>Ver mis citas y agendar</small>
            </div>
          </button>

          <button
            type="button"
            className={`role-tab-btn ${rol === 'estilista' ? 'active' : ''}`}
            onClick={() => setRol('estilista')}
          >
            <Scissors size={18} />
            <div>
              <strong>Soy Estilista</strong>
              <small>Ver mi agenda diaria</small>
            </div>
          </button>
        </div>

        {rol === 'estilista' && (
          <div className="security-notice-box">
            <ShieldCheck size={18} className="security-icon" />
            <div>
              <strong>Acceso Restringido:</strong> Solo estilistas con correo previamente autorizado por la administración pueden ingresar.
            </div>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        {googleClientId && (
          <div className="google-official-box">
            <div ref={googleBtnRef} className="google-btn-wrapper" />
            <div className="divider-text">o ingresa directamente</div>
          </div>
        )}

        <form onSubmit={handleDemoLogin} className="google-quick-form">
          <div className="google-info-note">
            <ShieldCheck size={18} className="note-icon" />
            <span>
              Ingresa con tu cuenta de Google como <strong>{rol === 'estilista' ? 'Estilista' : 'Clienta'}</strong>:
            </span>
          </div>

          {rol === 'estilista' && (
            <div className="demo-stylist-quick-picks">
              <span className="quick-picks-label">Cuentas para pruebas:</span>
              <div className="quick-picks-buttons">
                <button
                  type="button"
                  className={`chip-stylist-test ${emailDemo === 'valentina.estilista@gmail.com' ? 'selected' : ''}`}
                  onClick={() => {
                    setNombreDemo('Valentina Gómez');
                    setEmailDemo('valentina.estilista@gmail.com');
                  }}
                >
                  ✓ Valentina (Autorizada)
                </button>
                <button
                  type="button"
                  className={`chip-stylist-test ${emailDemo === 'sofia.estilista@gmail.com' ? 'selected' : ''}`}
                  onClick={() => {
                    setNombreDemo('Sofía Mendoza');
                    setEmailDemo('sofia.estilista@gmail.com');
                  }}
                >
                  ✓ Sofía (Autorizada)
                </button>
                <button
                  type="button"
                  className={`chip-stylist-test unauthorized ${emailDemo === 'no.autorizado@gmail.com' ? 'selected' : ''}`}
                  onClick={() => {
                    setNombreDemo('Persona No Autorizada');
                    setEmailDemo('no.autorizado@gmail.com');
                  }}
                  title="Prueba de intento no autorizado (debe ser bloqueado)"
                >
                  ⚠️ Probar no autorizada
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombreDemo}
              onChange={(e) => setNombreDemo(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico (Gmail)</label>
            <input
              type="email"
              value={emailDemo}
              onChange={(e) => setEmailDemo(e.target.value)}
              placeholder="tu.correo@gmail.com"
              required
            />
          </div>

          <button type="submit" className="btn-primary-action full-width" disabled={cargando}>
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
            <span>{cargando ? 'Accediendo...' : `Continuar como ${rol === 'estilista' ? 'Estilista' : 'Clienta'}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
