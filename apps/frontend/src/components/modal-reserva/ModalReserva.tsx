import React, { useState, useEffect } from 'react';
import { X, Clock, User, Phone, Mail, MessageSquare, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Servicio, Diseno } from '../../types';
import { crearReserva } from '../../services/api';

interface ModalReservaProps {
  fecha: string;
  servicios?: Servicio[];
  servicioInicial?: Servicio | null;
  disenoInicial?: Diseno | null;
  horaInicial?: string | null;
  onCerrar: () => void;
  onReservaExitosa: () => void;
}

export const ModalReserva: React.FC<ModalReservaProps> = ({
  fecha,
  servicios = [],
  servicioInicial = null,
  disenoInicial = null,
  horaInicial = null,
  onCerrar,
  onReservaExitosa,
}) => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(servicioInicial);
  const [disenoSeleccionado, setDisenoSeleccionado] = useState<Diseno | null>(disenoInicial);
  const [hora, setHora] = useState<string>(horaInicial || '10:00');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (servicioInicial) {
      setServicioSeleccionado(servicioInicial);
    }
  }, [servicioInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado || !fecha || !hora) {
      setError('Por favor selecciona un servicio, fecha y hora.');
      return;
    }

    setLoading(true);
    setError(null);

    crearReserva({
      cliente: {
        nombre,
        telefono,
        email: email || undefined,
      },
      servicio_id: servicioSeleccionado.id,
      diseno_id: disenoSeleccionado ? disenoSeleccionado.id : undefined,
      fecha,
      hora_inicio: hora,
    })
      .then((data: any) => {
        if (data) {
          onReservaExitosa();
          onCerrar();
        }
      })
      .catch((err: any) => {
        console.error('Error al crear la reserva:', err);
        setError(err?.response?.data?.error || err?.message || 'Error al procesar la reserva. Intenta de nuevo.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const precioTotal = (servicioSeleccionado?.precioBase || 0) + (disenoSeleccionado?.incrementoPrecio || 0);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card modal-reserva-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onCerrar} className="modal-close-btn" aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="modal-reserva-content">
          <div className="modal-header">
            <div className="modal-date-badge">
              <CalendarDays size={14} />
              {fecha}
            </div>
            <h3 className="modal-title">Confirmar Reserva</h3>
            <p className="modal-subtitle">Completa tus datos para agendar tu cita</p>
          </div>

          {error && (
            <div className="banner-aviso-precio">
              <AlertTriangle size={18} className="banner-aviso-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {servicios.length > 0 && !servicioInicial && (
              <div className="modal-section">
                <div className="section-label-group">
                  <span className="step-pill">1</span>
                  <div>
                    <p className="section-heading">Elige tu servicio</p>
                    <p className="section-subtext">Selecciona el servicio que deseas agendar</p>
                  </div>
                </div>
                <div className="servicios-cards-grid">
                  {servicios.map((s) => (
                    <div
                      key={s.id}
                      className={`servicio-option-card ${servicioSeleccionado?.id === s.id ? 'activo' : ''}`}
                      onClick={() => setServicioSeleccionado(s)}
                    >
                      <div className="card-top-row">
                        <span className="card-title">{s.nombre}</span>
                        {servicioSeleccionado?.id === s.id && <CheckCircle2 size={18} className="check-icon-active" />}
                      </div>
                      {s.descripcion && <p className="card-description">{s.descripcion}</p>}
                      <div className="card-meta-row">
                        <span className="meta-pill duration">
                          <Clock size={13} /> {s.duracionMinutos} min
                        </span>
                        <span className="meta-pill price">${s.precioBase?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-section">
              <div className="section-label-group">
                <span className="step-pill">2</span>
                <div>
                  <p className="section-heading">Hora de la cita</p>
                  <p className="section-subtext">Ajusta la hora si lo necesitas</p>
                </div>
              </div>
              <div className="input-with-icon">
                <Clock size={18} className="input-icon" />
                <input
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="styled-date-input"
                />
              </div>
            </div>

            <div className="modal-section">
              <div className="section-label-group">
                <span className="step-pill">3</span>
                <div>
                  <p className="section-heading">Tus datos de contacto</p>
                  <p className="section-subtext">Los usaremos para confirmar tu cita</p>
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="input-with-icon full-width">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre completo *"
                  />
                </div>

                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono / WhatsApp *"
                  />
                </div>

                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo (opcional)"
                  />
                </div>

                <div className="input-with-icon full-width">
                  <MessageSquare size={18} className="input-icon" />
                  <input
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas adicionales (opcional)"
                  />
                </div>
              </div>
            </div>

            <div className="modal-reserva-footer">
              <div className="resumen-rapido-box">
                {servicioSeleccionado && (
                  <div className="resumen-linea">
                    <span>Servicio</span>
                    <span>{servicioSeleccionado.nombre}</span>
                  </div>
                )}
                {disenoSeleccionado && (
                  <div className="resumen-linea">
                    <span>Diseño</span>
                    <span>{disenoSeleccionado.nombre}</span>
                  </div>
                )}
                <div className="resumen-total-linea">
                  <span>Total estimado</span>
                  <span className="precio-total-badge">${precioTotal.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onCerrar} disabled={loading} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary-action" style={{ flex: 1 }}>
                  {loading ? 'Confirmando...' : 'Confirmar Cita'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
