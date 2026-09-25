import { Calendar, Clock, Sparkles, DollarSign } from 'lucide-react';
import { Servicio, Diseno } from '../../types';

interface Props {
  servicio: Servicio;
  diseno?: Diseno;
  fecha: string;
  hora: string;
}

export function ResumenReserva({ servicio, diseno, fecha, hora }: Props) {
  const precioFinal = Number(servicio.precioBase) + (diseno ? Number(diseno.incrementoPrecio) : 0);

  return (
    <div className="resumen-reserva-card">
      <div className="resumen-card-header">
        <Sparkles size={18} className="text-accent" />
        <h4 className="resumen-title">Resumen de tu Cita</h4>
      </div>

      <div className="resumen-lista">
        <div className="resumen-fila">
          <span className="resumen-etiqueta">
            <Sparkles size={14} /> Servicio
          </span>
          <strong className="resumen-valor">{servicio.nombre}</strong>
        </div>

        <div className="resumen-fila">
          <span className="resumen-etiqueta">
            <Clock size={14} /> Duración
          </span>
          <span className="resumen-valor">{servicio.duracionMinutos} minutos</span>
        </div>

        <div className="resumen-fila">
          <span className="resumen-etiqueta">
            <Calendar size={14} /> Fecha y Hora
          </span>
          <strong className="resumen-valor">{fecha} a las {hora} hrs</strong>
        </div>

        <div className="resumen-fila">
          <span className="resumen-etiqueta">Diseño Nail Art</span>
          <span className="resumen-valor">{diseno ? diseno.nombre : 'Básico (sin adicional)'}</span>
        </div>

        <div className="resumen-fila total">
          <span className="resumen-etiqueta">
            <DollarSign size={16} /> Total Estimado
          </span>
          <strong className="resumen-total-valor">${precioFinal.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
