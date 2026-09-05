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
  horarioApertura: string;
  horarioCierre: string;
  textoBannerPrecio: string;
}

export interface DatosCliente {
  nombre: string;
  telefono: string;
  email?: string;
}
