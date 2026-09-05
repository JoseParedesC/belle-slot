import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const api = axios.create({ baseURL: API_URL });
export async function obtenerServicios() {
    const { data } = await api.get('/servicios');
    return data;
}
export async function obtenerDisenos(servicioId) {
    const { data } = await api.get(`/servicios/${servicioId}/disenos`);
    return data;
}
export async function obtenerConfiguracion() {
    const { data } = await api.get('/configuracion');
    return data;
}
export async function obtenerDisponibilidad(fecha, servicioId) {
    const { data } = await api.get('/disponibilidad', {
        params: { fecha, servicio_id: servicioId },
    });
    return data.horarios_disponibles;
}
export async function crearReserva(payload) {
    const { data } = await api.post('/reservas', payload);
    return data;
}
// ---- Admin ----
export function guardarToken(token) {
    localStorage.setItem('admin_token', token);
}
export function obtenerToken() {
    return localStorage.getItem('admin_token');
}
export function cerrarSesion() {
    localStorage.removeItem('admin_token');
}
export async function login(usuario, password) {
    const { data } = await api.post('/auth/login', { usuario, password });
    guardarToken(data.token);
    return data.token;
}
function authHeaders() {
    return { Authorization: `Bearer ${obtenerToken()}` };
}
export async function obtenerReservasAdmin(fecha) {
    const { data } = await api.get('/admin/reservas', {
        params: { fecha },
        headers: authHeaders(),
    });
    return data;
}
export async function cambiarEstadoReservaAdmin(id, estado) {
    const { data } = await api.patch(`/admin/reservas/${id}/estado`, { estado }, { headers: authHeaders() });
    return data;
}
export async function obtenerReporteOcupacion() {
    const { data } = await api.get('/admin/reportes/ocupacion', { headers: authHeaders() });
    return data;
}
