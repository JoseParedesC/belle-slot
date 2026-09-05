import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, LogOut, CheckCircle, XCircle, Clock, Sparkles, Phone, User } from 'lucide-react';
import {
  obtenerReservasAdmin,
  cambiarEstadoReservaAdmin,
  cerrarSesion,
  obtenerToken,
} from '../../services/api';
import { ReservaItem } from '../../types';

export function AdminCalendario() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
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
      setReservas(data || []);
    } finally {
      setCargando(false);
    }
  }

  async function marcarEstado(id: string, estado: 'completada' | 'no_asistio') {
    await cambiarEstadoReservaAdmin(id, estado);
    cargarReservas();
  }

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-container">
        <div className="admin-header-bar">
          <div>
            <div className="modal-badge">
              <Sparkles size={16} /> Panel de Administración
            </div>
            <h1 className="admin-title">Gestión General de Reservas</h1>
          </div>

          <div className="admin-header-actions">
            <Link to="/" className="btn-secondary">
              Ver Sitio Público
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

        <div className="admin-filter-bar">
          <div className="input-with-icon">
            <Calendar size={18} className="input-icon" />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="styled-date-input"
            />
          </div>

          <div className="admin-stats-summary">
            <span>Total del día: <strong>{reservas.length}</strong></span>
            <span>Completadas: <strong>{reservas.filter((r) => r.estado === 'completada').length}</strong></span>
          </div>
        </div>

        {cargando && (
          <div className="loading-state">
            <div className="spinner-mini" />
            <span>Cargando reservas...</span>
          </div>
        )}

        {!cargando && reservas.length === 0 ? (
          <div className="empty-reservas-card">
            <Clock size={36} />
            <p>No hay reservas registradas para esta fecha.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="tabla-reservas-moderna">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Clienta</th>
                  <th>Contacto</th>
                  <th>Servicio</th>
                  <th>Diseño Nail Art</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="hora-pill-table">{r.horaInicio} - {r.horaFin}</span>
                    </td>
                    <td>
                      <div className="table-client-cell">
                        <User size={15} />
                        <strong>{r.cliente.nombre}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="table-contact-cell">
                        <Phone size={14} /> {r.cliente.telefono}
                      </span>
                    </td>
                    <td>{r.servicio.nombre}</td>
                    <td>{r.diseno?.nombre || '-'}</td>
                    <td>
                      <strong>${Number(r.precioEstimado).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`badge-estado-pill ${r.estado}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td>
                      {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                        <div className="table-actions-group">
                          <button
                            type="button"
                            className="btn-table-action complete"
                            onClick={() => marcarEstado(r.id, 'completada')}
                            title="Completada"
                          >
                            <CheckCircle size={14} /> Completada
                          </button>
                          <button
                            type="button"
                            className="btn-table-action cancel"
                            onClick={() => marcarEstado(r.id, 'no_asistio')}
                            title="No asistió"
                          >
                            <XCircle size={14} /> No asistió
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
