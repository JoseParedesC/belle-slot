import { Diseno } from '../../types';

interface Props {
  disenos: Diseno[];
  disenoSeleccionado?: string;
  onSeleccionar: (diseno: Diseno) => void;
}

export function SelectorDiseno({ disenos, disenoSeleccionado, onSeleccionar }: Props) {
  return (
    <div className="selector-diseno">
      <h3>Elige el diseño</h3>
      <div className="lista-disenos">
        {disenos.map((d) => (
          <button
            key={d.id}
            className={d.id === disenoSeleccionado ? 'activo' : ''}
            onClick={() => onSeleccionar(d)}
          >
            <strong>{d.nombre}</strong>
            {d.incrementoPrecio > 0 && <span>+${d.incrementoPrecio.toLocaleString()}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
