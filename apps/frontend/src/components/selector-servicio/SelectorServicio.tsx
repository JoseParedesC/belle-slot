import { Servicio } from '../../types';

interface Props {
  servicios: Servicio[];
  servicioSeleccionado?: string;
  onSeleccionar: (servicio: Servicio) => void;
}

export function SelectorServicio({ servicios, servicioSeleccionado, onSeleccionar }: Props) {
  return (
    <div className="selector-servicio">
      <h3>Elige el servicio</h3>
      <div className="lista-servicios">
        {servicios.map((s) => (
          <button
            key={s.id}
            className={s.id === servicioSeleccionado ? 'activo' : ''}
            onClick={() => onSeleccionar(s)}
          >
            <strong>{s.nombre}</strong>
            <span>{s.duracionMinutos} min · desde ${s.precioBase.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
