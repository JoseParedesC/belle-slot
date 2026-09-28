import { useEffect, useState } from 'react';
import { obtenerDisponibilidad } from '../../services/api';

interface Props {
  servicioId: string;
  onSeleccionarFechaHora: (fecha: string, hora: string) => void;
}

export function Calendario({ servicioId, onSeleccionarFechaHora }: Props) {
  const [fecha, setFecha] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!fecha || !servicioId) return;
    setCargando(true);
    obtenerDisponibilidad(fecha, servicioId)
      .then(setHorarios)
      .finally(() => setCargando(false));
  }, [fecha, servicioId]);

  return (
    <div className="calendario">
      <h3>Elige fecha y hora</h3>
      <input
        type="date"
        value={fecha}
        min={new Date().toISOString().split('T')[0]}
        onChange={(e) => {
          setFecha(e.target.value);
          setHoraSeleccionada('');
        }}
      />

      {cargando && <p>Buscando horarios disponibles...</p>}

      {!cargando && fecha && horarios.length === 0 && (
        <p>No hay horarios disponibles para esta fecha.</p>
      )}

      <div className="lista-horarios">
        {horarios.map((h) => (
          <button
            key={h}
            className={h === horaSeleccionada ? 'activo' : ''}
            onClick={() => {
              setHoraSeleccionada(h);
              onSeleccionarFechaHora(fecha, h);
            }}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}
