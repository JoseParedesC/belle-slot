import { Check, Palette } from 'lucide-react';
import { Diseno } from '../../types';

interface Props {
  disenos: Diseno[];
  disenoSeleccionado?: string;
  onSeleccionar: (diseno?: Diseno) => void;
}

export function SelectorDiseno({ disenos, disenoSeleccionado, onSeleccionar }: Props) {
  return (
    <div className="selector-diseno-container">
      <div className="section-title-wrap">
        <Palette size={18} className="text-accent" />
        <h4 className="section-title-sm">Diseño / Decoración</h4>
      </div>
      <p className="section-subtitle">Opciones de nail art personalizadas</p>

      <div className="lista-disenos-grid">
        <button
          type="button"
          className={`diseno-card-btn ${!disenoSeleccionado ? 'activo' : ''}`}
          onClick={() => onSeleccionar(undefined)}
        >
          <div className="diseno-header">
            <span className="diseno-nombre">Básico / Sin Nail Art</span>
            {!disenoSeleccionado && <Check size={14} className="diseno-check" />}
          </div>
          <span className="diseno-precio-badge zero">Incluido</span>
        </button>

        {disenos.map((d) => {
          const activo = d.id === disenoSeleccionado;
          return (
            <button
              key={d.id}
              type="button"
              className={`diseno-card-btn ${activo ? 'activo' : ''}`}
              onClick={() => onSeleccionar(d)}
            >
              <div className="diseno-header">
                <span className="diseno-nombre">{d.nombre}</span>
                {activo && <Check size={14} className="diseno-check" />}
              </div>
              <span className="diseno-precio-badge">
                {Number(d.incrementoPrecio) > 0 ? `+$${Number(d.incrementoPrecio).toLocaleString()}` : 'Incluido'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
