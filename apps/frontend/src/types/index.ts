export interface Empresa {
  id: string;
  nombre: string;
  slug: string;
  logoUrl?: string | null;
  direccion?: string | null;
  telefonoWhatsapp?: string | null;
  emailContacto?: string | null;
  horarioApertura: string;
  horarioCierre: string;
  diasAtencion: string[];
  duracionBloqueMinutos?: number;
  horasAnticipacionCancelacion?: number;
  textoBannerPrecio?: string | null;
  plan?: string;
  activo?: boolean;
  _count?: {
    servicios?: number;
    empleadas?: number;
    reservas?: number;
  };
}

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
  slug?: string;
  logoUrl?: string;
  direccion?: string;
  telefonoWhatsapp?: string;
  emailContacto?: string;
  horarioApertura: string;
  horarioCierre: string;
  diasAtencion?: string[];
  duracionBloqueMinutos?: number;
  horasAnticipacionCancelacion?: number;
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
  empresaId?: string;
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

