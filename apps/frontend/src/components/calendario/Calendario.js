import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { obtenerDisponibilidad } from '../../services/api';
export function Calendario({ servicioId, onSeleccionarFechaHora }) {
    const [fecha, setFecha] = useState('');
    const [horarios, setHorarios] = useState([]);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [cargando, setCargando] = useState(false);
    useEffect(() => {
        if (!fecha || !servicioId)
            return;
        setCargando(true);
        obtenerDisponibilidad(fecha, servicioId)
            .then(setHorarios)
            .finally(() => setCargando(false));
    }, [fecha, servicioId]);
    return (_jsxs("div", { className: "calendario", children: [_jsx("h3", { children: "Elige fecha y hora" }), _jsx("input", { type: "date", value: fecha, min: new Date().toISOString().split('T')[0], onChange: (e) => {
                    setFecha(e.target.value);
                    setHoraSeleccionada('');
                } }), cargando && _jsx("p", { children: "Buscando horarios disponibles..." }), !cargando && fecha && horarios.length === 0 && (_jsx("p", { children: "No hay horarios disponibles para esta fecha." })), _jsx("div", { className: "lista-horarios", children: horarios.map((h) => (_jsx("button", { className: h === horaSeleccionada ? 'activo' : '', onClick: () => {
                        setHoraSeleccionada(h);
                        onSeleccionarFechaHora(fecha, h);
                    }, children: h }, h))) })] }));
}
