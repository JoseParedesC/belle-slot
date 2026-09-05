import { Clock, Check, Sparkles } from 'lucide-react';
import { Servicio } from '../../types';

interface Props {
  servicios: Servicio[];
  servicioSeleccionado?: string;
  onSeleccionar: (servicio: Servicio) => void;
}

export function SelectorServicio({ servicios, servicioSeleccionado, onSeleccionar }: Props) {
  return (
    <div className="selector-servicio-container">
      <div className="section-title-wrap">
        <Sparkles size={18} className="text-accent" />
        <h3 className="section-title">Nuestros Servicios</h3>
      </div>
      <p className="section-subtitle">Selecciona el tratamiento que deseas para consultar disponibilidad</p>

      <div className="lista-servicios-grid">
        {servicios.map((s) => {
          const activo = s.id === servicioSeleccionado;
          return (
            <button
              key={s.id}
              type="button"
              className={`servicio-card-btn ${activo ? 'activo' : ''}`}
              onClick={() => onSeleccionar(s)}
            >
              <div className="servicio-card-header">
                <span className="servicio-nombre">{s.nombre}</span>
                {activo && (
                  <span className="servicio-check-badge">
                    <Check size={14} />
                  </span>
                )}
              </div>
              {s.descripcion && <p className="servicio-desc">{s.descripcion}</p>}
              <div className="servicio-card-footer">
                <span className="servicio-duracion">
                  <Clock size={13} /> {s.duracionMinutos} min
                </span>
                <span className="servicio-precio">
                  desde ${Number(s.precioBase).toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
