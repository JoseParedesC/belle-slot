import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';

export function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(usuario, password);
      navigate('/admin/calendario');
    } catch {
      setError('Usuario o contraseña incorrectos');
    }
  }

  return (
    <div className="pagina-reservar">
      <h1>Ingreso administrador</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
