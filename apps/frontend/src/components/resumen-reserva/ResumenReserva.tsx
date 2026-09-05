import { Servicio, Diseno } from '../../types';

interface Props {
  servicio: Servicio;
  diseno?: Diseno;
  fecha: string;
  hora: string;
}

export function ResumenReserva({ servicio, diseno, fecha, hora }: Props) {
  const precioFinal = servicio.precioBase + (diseno?.incrementoPrecio || 0);

  return (
    <div className="resumen-reserva">
      <h3>Resumen de tu reserva</h3>
      <ul>
        <li><strong>Servicio:</strong> {servicio.nombre}</li>
        <li><strong>Diseño:</strong> {diseno ? diseno.nombre : 'No seleccionado'}</li>
        <li><strong>Fecha:</strong> {fecha}</li>
        <li><strong>Hora:</strong> {hora}</li>
        <li><strong>Precio estimado:</strong> ${precioFinal.toLocaleString()}</li>
      </ul>
    </div>
  );
}
