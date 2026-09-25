import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Phone,
  User,
  Scissors,
  Plus,
  Mail,
  ShieldCheck,
  X,
  Search,
  Filter,
  RotateCcw,
  Tag,
  DollarSign
} from 'lucide-react';
import {
  obtenerReservasAdmin,
  cambiarEstadoReservaAdmin,
  obtenerEstilistasAdmin,
  crearEstilistaAdmin,
  cambiarEstadoEstilistaAdmin,
  obtenerServicios,
  cerrarSesion,
  obtenerToken,
} from '../../services/api';
import { ReservaItem, Empleada, Servicio } from '../../types';

function padZero(n: number) {
  return n.toString().padStart(2, '0');
}

function obtenerRangoHoy() {
  const d = new Date();
  const hoy = `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
  return { inicio: hoy, fin: hoy };
}

function obtenerRangoSemana() {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const lunes = new Date(new Date().setDate(diffToMonday));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return {
    inicio: `${lunes.getFullYear()}-${padZero(lunes.getMonth() + 1)}-${padZero(lunes.getDate())}`,
    fin: `${domingo.getFullYear()}-${padZero(domingo.getMonth() + 1)}-${padZero(domingo.getDate())}`,
  };
}

function obtenerRangoMes() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const ultimoDia = new Date(y, m + 1, 0);
  return {
    inicio: `${y}-${padZero(m + 1)}-01`,
    fin: `${y}-${padZero(m + 1)}-${padZero(ultimoDia.getDate())}`,
  };
}

export function AdminCalendario() {
  const [pestana, setPestana] = useState<'reservas' | 'estilistas'>('reservas');
  
  // Filtros de Citas
  const [fechaInicio, setFechaInicio] = useState(obtenerRangoMes().inicio);
  const [fechaFin, setFechaFin] = useState(obtenerRangoMes().fin);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroServicio, setFiltroServicio] = useState('');
  
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [estilistas, setEstilistas] = useState<Empleada[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoEstilistas, setCargandoEstilistas] = useState(false);

  // Modal para nueva estilista
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nombreEst, setNombreEst] = useState('');
  const [emailEst, setEmailEst] = useState('');
  const [telefonoEst, setTelefonoEst] = useState('');
  const [guardandoEst, setGuardandoEst] = useState(false);
  const [errorEst, setErrorEst] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    obtenerServicios().then(setServicios).catch(console.error);
  }, []);

  useEffect(() => {
    if (!obtenerToken()) {
      navigate('/admin/login');
      return;
    }
    if (pestana === 'reservas') {
      cargarReservas();
    } else {
      cargarEstilistas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin, filtroCliente, filtroServicio, pestana]);

  async function cargarReservas() {
    setCargando(true);
    try {
      const data = await obtenerReservasAdmin({
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        cliente: filtroCliente.trim() || undefined,
        servicio_id: filtroServicio || undefined,
      });
      setReservas(data || []);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
    } finally {
      setCargando(false);
    }
  }

  async function cargarEstilistas() {
    setCargandoEstilistas(true);
    try {
      const data = await obtenerEstilistasAdmin();
      setEstilistas(data || []);
    } catch (err) {
      console.error('Error al cargar estilistas:', err);
    } finally {
      setCargandoEstilistas(false);
    }
  }

  async function marcarEstado(id: string, estado: 'completada' | 'no_asistio') {
    await cambiarEstadoReservaAdmin(id, estado);
    cargarReservas();
  }

  async function toggleEstadoEstilista(est: Empleada) {
    try {
      await cambiarEstadoEstilistaAdmin(est.id, !est.activo);
      cargarEstilistas();
    } catch (err) {
      alert('No se pudo modificar el estado de la estilista');
    }
  }

  async function handleCrearEstilista(e: React.FormEvent) {
    e.preventDefault();
    setErrorEst('');
    setGuardandoEst(true);
    try {
      await crearEstilistaAdmin({
        nombre: nombreEst,
        email: emailEst,
        telefono: telefonoEst || undefined,
      });
      setNombreEst('');
      setEmailEst('');
      setTelefonoEst('');
      setModalNuevo(false);
      cargarEstilistas();
    } catch (err: any) {
      setErrorEst(err?.response?.data?.error || 'Error al registrar estilista');
    } finally {
      setGuardandoEst(false);
    }
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

        {/* Selector de Pestañas del Panel */}
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${pestana === 'reservas' ? 'active' : ''}`}
            onClick={() => setPestana('reservas')}
          >
            <Calendar size={17} /> Citas y Reservas
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${pestana === 'estilistas' ? 'active' : ''}`}
            onClick={() => setPestana('estilistas')}
          >
            <Scissors size={17} /> Estilistas Autorizadas ({estilistas.length})
          </button>
        </div>

        {pestana === 'reservas' ? (
          <>
            {/* Barra de Filtros Avanzada */}
            <div className="admin-advanced-filters-card">
              <div className="filters-header-row">
                <div className="filters-title">
                  <Filter size={18} className="text-accent" />
                  <strong>Filtros de Búsqueda de Citas</strong>
                </div>

                <div className="quick-range-chips">
                  <button
                    type="button"
                    className={`range-chip-btn ${fechaInicio === obtenerRangoHoy().inicio && fechaFin === obtenerRangoHoy().fin ? 'active' : ''}`}
                    onClick={() => {
                      const r = obtenerRangoHoy();
                      setFechaInicio(r.inicio);
                      setFechaFin(r.fin);
                    }}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    className={`range-chip-btn ${fechaInicio === obtenerRangoSemana().inicio && fechaFin === obtenerRangoSemana().fin ? 'active' : ''}`}
                    onClick={() => {
                      const r = obtenerRangoSemana();
                      setFechaInicio(r.inicio);
                      setFechaFin(r.fin);
                    }}
                  >
                    Esta Semana
                  </button>
                  <button
                    type="button"
                    className={`range-chip-btn ${fechaInicio === obtenerRangoMes().inicio && fechaFin === obtenerRangoMes().fin ? 'active' : ''}`}
                    onClick={() => {
                      const r = obtenerRangoMes();
                      setFechaInicio(r.inicio);
                      setFechaFin(r.fin);
                    }}
                  >
                    Este Mes
                  </button>
                  <button
                    type="button"
                    className={`range-chip-btn ${!fechaInicio && !fechaFin ? 'active' : ''}`}
                    onClick={() => {
                      setFechaInicio('');
                      setFechaFin('');
                    }}
                  >
                    Ver Todas
                  </button>
                </div>
              </div>

              <div className="filters-inputs-grid">
                {/* Rango de Fechas */}
                <div className="filter-field-group">
                  <label>Fecha Desde</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="styled-filter-input"
                    />
                  </div>
                </div>

                <div className="filter-field-group">
                  <label>Fecha Hasta</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="styled-filter-input"
                    />
                  </div>
                </div>

                {/* Filtro de Cliente */}
                <div className="filter-field-group cliente-field">
                  <label>Cliente (Nombre, Teléfono o Correo)</label>
                  <div className="input-with-icon">
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      placeholder="Ej. Camila, 300123..., camila@gmail.com"
                      className="styled-filter-input"
                    />
                    {filtroCliente && (
                      <button
                        type="button"
                        className="clear-input-btn"
                        onClick={() => setFiltroCliente('')}
                        title="Limpiar búsqueda"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro de Servicio */}
                <div className="filter-field-group">
                  <label>Servicio</label>
                  <div className="input-with-icon">
                    <Tag size={16} className="input-icon" />
                    <select
                      value={filtroServicio}
                      onChange={(e) => setFiltroServicio(e.target.value)}
                      className="styled-filter-input styled-select"
                    >
                      <option value="">Todos los servicios</option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="filters-footer-summary">
                <div className="admin-stats-summary">
                  <span>Total citas: <strong>{reservas.length}</strong></span>
                  <span>Completadas: <strong>{reservas.filter((r) => r.estado === 'completada').length}</strong></span>
                  <span>Ingresos estimados: <strong>${reservas.reduce((acc, r) => acc + Number(r.precioEstimado || 0), 0).toLocaleString()}</strong></span>
                </div>

                {(fechaInicio || fechaFin || filtroCliente || filtroServicio) && (
                  <button
                    type="button"
                    className="btn-clear-all-filters"
                    onClick={() => {
                      const r = obtenerRangoMes();
                      setFechaInicio(r.inicio);
                      setFechaFin(r.fin);
                      setFiltroCliente('');
                      setFiltroServicio('');
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Restablecer filtros</span>
                  </button>
                )}
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
                <p>No se encontraron citas con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="tabla-reservas-moderna">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Clienta</th>
                      <th>Contacto</th>
                      <th>Servicio</th>
                      <th>Diseño Nail Art</th>
                      <th>Estilista</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r) => {
                      const fechaCita = typeof r.fecha === 'string'
                        ? r.fecha.split('T')[0]
                        : new Date(r.fecha).toISOString().split('T')[0];

                      return (
                        <tr key={r.id}>
                          <td>
                            <span className="table-date-badge">
                              <Calendar size={13} /> {fechaCita}
                            </span>
                          </td>
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
                            <span className="estilista-cell-tag">
                              {r.empleada?.nombre || 'Sin asignar'}
                            </span>
                          </td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          /* Vista de Estilistas Autorizadas */
          <div className="estilistas-admin-section">
            <div className="section-toolbar-row">
              <div>
                <h2>Lista Blanca de Estilistas</h2>
                <p className="toolbar-subtext">
                  Solo los correos registrados aquí tienen permiso para acceder a la agenda del salón con Google.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setModalNuevo(true)}
              >
                <Plus size={17} />
                <span>Autorizar Nueva Estilista</span>
              </button>
            </div>

            {cargandoEstilistas ? (
              <div className="loading-state">
                <div className="spinner-mini" />
                <span>Cargando estilistas...</span>
              </div>
            ) : estilistas.length === 0 ? (
              <div className="empty-reservas-card">
                <Scissors size={36} />
                <p>No hay estilistas registradas aún en el sistema.</p>
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table className="tabla-reservas-moderna">
                  <thead>
                    <tr>
                      <th>Nombre de la Profesional</th>
                      <th>Correo de Google (Acceso)</th>
                      <th>Teléfono</th>
                      <th>Estado de Acceso</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estilistas.map((est) => (
                      <tr key={est.id}>
                        <td>
                          <div className="table-client-cell">
                            <User size={16} />
                            <strong>{est.nombre}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="table-contact-cell">
                            <Mail size={15} />
                            <span>{est.email || 'Sin correo asignado'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-contact-cell">
                            <Phone size={14} /> {est.telefono || '-'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-estado-pill ${est.activo ? 'confirmada' : 'cancelada'}`}>
                            {est.activo ? 'Autorizada / Activa' : 'Acceso Revocado'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn-table-action ${est.activo ? 'cancel' : 'complete'}`}
                            onClick={() => toggleEstadoEstilista(est)}
                          >
                            {est.activo ? 'Revocar Acceso' : 'Habilitar Acceso'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal para Autorizar Nueva Estilista */}
        {modalNuevo && (
          <div className="modal-overlay" onClick={() => setModalNuevo(false)}>
            <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalNuevo(false)}
              >
                <X size={20} />
              </button>

              <div className="modal-header">
                <div className="modal-badge">
                  <ShieldCheck size={16} /> Permisos de Acceso
                </div>
                <h2 className="modal-title">Autorizar Nueva Estilista</h2>
                <p className="modal-subtitle">
                  Registra el correo de Google de la profesional para que pueda ingresar al portal de estilistas.
                </p>
              </div>

              {errorEst && <div className="error-alert">{errorEst}</div>}

              <form onSubmit={handleCrearEstilista} className="google-quick-form">
                <div className="form-group">
                  <label>Nombre y Apellido</label>
                  <input
                    type="text"
                    value={nombreEst}
                    onChange={(e) => setNombreEst(e.target.value)}
                    placeholder="Ej. Carolina Pérez"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico de Google (Gmail)</label>
                  <input
                    type="email"
                    value={emailEst}
                    onChange={(e) => setEmailEst(e.target.value)}
                    placeholder="carolina.estilista@gmail.com"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    Debe ser el correo con el que la estilista iniciará sesión mediante el botón de Google.
                  </small>
                </div>

                <div className="form-group">
                  <label>Teléfono de Contacto (WhatsApp)</label>
                  <input
                    type="tel"
                    value={telefonoEst}
                    onChange={(e) => setTelefonoEst(e.target.value)}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setModalNuevo(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-action"
                    style={{ flex: 2 }}
                    disabled={guardandoEst}
                  >
                    {guardandoEst ? 'Guardando...' : 'Autorizar Estilista'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
