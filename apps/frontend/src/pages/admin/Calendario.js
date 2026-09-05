import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerReservasAdmin, cambiarEstadoReservaAdmin, cerrarSesion, obtenerToken, } from '../../services/api';
export function AdminCalendario() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (!obtenerToken()) {
            navigate('/admin/login');
            return;
        }
        cargarReservas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);
    async function cargarReservas() {
        setCargando(true);
        try {
            const data = await obtenerReservasAdmin(fecha);
            setReservas(data);
        }
        finally {
            setCargando(false);
        }
    }
    async function marcarEstado(id, estado) {
        await cambiarEstadoReservaAdmin(id, estado);
        cargarReservas();
    }
    return (_jsxs("div", { className: "pagina-reservar admin", children: [_jsxs("div", { className: "admin-header", children: [_jsx("h1", { children: "Reservas del d\u00EDa" }), _jsx("button", { onClick: () => {
                            cerrarSesion();
                            navigate('/admin/login');
                        }, children: "Cerrar sesi\u00F3n" })] }), _jsx("input", { type: "date", value: fecha, onChange: (e) => setFecha(e.target.value) }), cargando && _jsx("p", { children: "Cargando..." }), _jsxs("table", { className: "tabla-reservas", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Hora" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Servicio" }), _jsx("th", { children: "Dise\u00F1o" }), _jsx("th", { children: "Estado" }), _jsx("th", { children: "Acciones" })] }) }), _jsx("tbody", { children: reservas.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.horaInicio }), _jsx("td", { children: r.cliente.nombre }), _jsx("td", { children: r.servicio.nombre }), _jsx("td", { children: r.diseno?.nombre || '-' }), _jsx("td", { children: r.estado }), _jsx("td", { children: (r.estado === 'pendiente' || r.estado === 'confirmada') && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => marcarEstado(r.id, 'completada'), children: "Completada" }), _jsx("button", { onClick: () => marcarEstado(r.id, 'no_asistio'), children: "No asisti\u00F3" })] })) })] }, r.id))) })] }), !cargando && reservas.length === 0 && _jsx("p", { children: "No hay reservas para esta fecha." })] }));
}
