import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerReservasAdmin,
  cambiarEstadoReservaAdmin,
  cerrarSesion,
  obtenerToken,
} from '../../services/api';

export function AdminCalendario() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!obtenerToken()) {
      navigate('/admin/login');
      return;
    }
    cargarReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function cargarReservas() {
    setCargando(true);
    try {
      const data = await obtenerReservasAdmin(fecha);
      setReservas(data);
    } finally {
      setCargando(false);
    }
  }

  async function marcarEstado(id: string, estado: 'completada' | 'no_asistio') {
    await cambiarEstadoReservaAdmin(id, estado);
    cargarReservas();
  }

  return (
    <div className="pagina-reservar admin">
      <div className="admin-header">
        <h1>Reservas del día</h1>
        <button
          onClick={() => {
            cerrarSesion();
            navigate('/admin/login');
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      {cargando && <p>Cargando...</p>}

      <table className="tabla-reservas">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Diseño</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.horaInicio}</td>
              <td>{r.cliente.nombre}</td>
              <td>{r.servicio.nombre}</td>
              <td>{r.diseno?.nombre || '-'}</td>
              <td>{r.estado}</td>
              <td>
                {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                  <>
                    <button onClick={() => marcarEstado(r.id, 'completada')}>Completada</button>
                    <button onClick={() => marcarEstado(r.id, 'no_asistio')}>No asistió</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!cargando && reservas.length === 0 && <p>No hay reservas para esta fecha.</p>}
    </div>
  );
}
