export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precioBase: number;
}

export interface Diseno {
  id: string;
  nombre: string;
  incrementoPrecio: number;
  imagenReferenciaUrl?: string;
}

export interface Configuracion {
  id?: string;
  nombreNegocio?: string;
  direccion?: string;
  telefonoWhatsapp?: string;
  horarioApertura: string;
  horarioCierre: string;
  diasAtencion?: string[];
  textoBannerPrecio?: string;
}

export interface DatosCliente {
  nombre: string;
  telefono: string;
  email?: string;
}

export type RolUsuario = 'cliente' | 'estilista' | 'admin';

export interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  rol: RolUsuario;
  foto?: string;
}

export interface Empleada {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio';

export interface ReservaItem {
  id: string;
  clienteId: string;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
  };
  servicioId: string;
  servicio: Servicio;
  disenoId?: string;
  diseno?: Diseno;
  empleadaId?: string;
  empleada?: Empleada;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioEstimado: number;
  estado: EstadoReserva;
  fechaCreacion?: string;
}

