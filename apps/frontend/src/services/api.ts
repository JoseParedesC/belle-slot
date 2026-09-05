import axios from 'axios';
import { Usuario, Empleada, ReservaItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_URL });

export async function obtenerServicios() {
  const { data } = await api.get('/servicios');
  return data;
}

export async function obtenerDisenos(servicioId: string) {
  const { data } = await api.get(`/servicios/${servicioId}/disenos`);
  return data;
}

export async function obtenerConfiguracion() {
  const { data } = await api.get('/configuracion');
  return data;
}

export async function obtenerDisponibilidad(fecha: string, servicioId: string) {
  const { data } = await api.get('/disponibilidad', {
    params: { fecha, servicio_id: servicioId },
  });
  return data.horarios_disponibles as string[];
}

export async function crearReserva(payload: {
  cliente: { nombre: string; telefono: string; email?: string };
  servicio_id: string;
  diseno_id?: string;
  fecha: string;
  hora_inicio: string;
}) {
  const { data } = await api.post('/reservas', payload);
  return data;
}

export async function obtenerMisReservas(email?: string, telefono?: string): Promise<ReservaItem[]> {
  const { data } = await api.get('/reservas/cliente/mis-reservas', {
    params: { email, telefono },
  });
  return data;
}

// ---- Autenticación y Usuario ----

const TOKEN_KEY = 'belle_slot_token';
const USER_KEY = 'belle_slot_user';

export function guardarToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('admin_token', token);
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('admin_token');
}

export function guardarUsuarioActual(usuario: Usuario) {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function obtenerUsuarioActual(): Usuario | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Usuario;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('admin_token');
}

export function authHeaders() {
  const token = obtenerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(usuario: string, password: string) {
  const { data } = await api.post('/auth/login', { usuario, password });
  if (data.token) {
    guardarToken(data.token);
  }
  if (data.usuario) {
    guardarUsuarioActual(data.usuario);
  }
  return data;
}

export async function loginConGoogle(payload: {
  credential?: string;
  rol: 'estilista' | 'cliente';
  email?: string;
  nombre?: string;
  foto?: string;
  telefono?: string;
}) {
  const { data } = await api.post('/auth/google', payload);
  if (data.token) {
    guardarToken(data.token);
  }
  if (data.usuario) {
    guardarUsuarioActual(data.usuario);
  }
  return data;
}

export async function obtenerEstilistas(): Promise<Empleada[]> {
  const { data } = await api.get('/auth/estilistas');
  return data;
}

export interface FiltrosReservasAdmin {
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente?: string;
  servicio_id?: string;
  empleada_id?: string;
  estado?: string;
}

export async function obtenerReservasAdmin(
  fechaOFiltros?: string | FiltrosReservasAdmin,
  empleadaId?: string
): Promise<ReservaItem[]> {
  let params: any = {};
  if (typeof fechaOFiltros === 'string') {
    if (fechaOFiltros) params.fecha = fechaOFiltros;
    if (empleadaId) params.empleada_id = empleadaId;
  } else if (fechaOFiltros && typeof fechaOFiltros === 'object') {
    params = { ...fechaOFiltros };
  }

  const { data } = await api.get('/admin/reservas', {
    params,
    headers: authHeaders(),
  });
  return data;
}

export async function cambiarEstadoReservaAdmin(id: string, estado: 'completada' | 'no_asistio' | 'cancelada') {
  const { data } = await api.patch(
    `/admin/reservas/${id}/estado`,
    { estado },
    { headers: authHeaders() }
  );
  return data;
}

export async function obtenerEstilistasAdmin(): Promise<Empleada[]> {
  const { data } = await api.get('/admin/estilistas', { headers: authHeaders() });
  return data;
}

export async function crearEstilistaAdmin(payload: { nombre: string; email: string; telefono?: string }) {
  const { data } = await api.post('/admin/estilistas', payload, { headers: authHeaders() });
  return data;
}

export async function cambiarEstadoEstilistaAdmin(id: string, activo: boolean) {
  const { data } = await api.patch(`/admin/estilistas/${id}/estado`, { activo }, { headers: authHeaders() });
  return data;
}

export async function obtenerReporteOcupacion() {
  const { data } = await api.get('/admin/reportes/ocupacion', { headers: authHeaders() });
  return data;
}


