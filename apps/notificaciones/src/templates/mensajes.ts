interface DatosCita {
  fecha: string;
  hora: string;
  servicio: string;
}

export function textoConfirmacion(nombre: string, datos: DatosCita): string {
  return `Hola ${nombre}, tu reserva de ${datos.servicio} quedó confirmada para el ${datos.fecha} a las ${datos.hora}. ¡Te esperamos!`;
}

export function textoRecordatorio24h(nombre: string, datos: DatosCita): string {
  return `Hola ${nombre}, te recordamos tu cita de ${datos.servicio} mañana ${datos.fecha} a las ${datos.hora}. Responde CONFIRMAR o CANCELAR.`;
}

export function textoRecordatorio2h(nombre: string, datos: DatosCita): string {
  return `Hola ${nombre}, tu cita de ${datos.servicio} es hoy a las ${datos.hora}. ¡Te esperamos pronto!`;
}

export function textoPorTipo(tipo: string, nombre: string, datos: DatosCita): string {
  switch (tipo) {
    case 'confirmacion_reserva':
      return textoConfirmacion(nombre, datos);
    case 'recordatorio_24h':
      return textoRecordatorio24h(nombre, datos);
    case 'recordatorio_2h':
      return textoRecordatorio2h(nombre, datos);
    default:
      return textoConfirmacion(nombre, datos);
  }
}
