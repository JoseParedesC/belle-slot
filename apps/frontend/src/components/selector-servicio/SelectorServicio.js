import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SelectorServicio({ servicios, servicioSeleccionado, onSeleccionar }) {
    return (_jsxs("div", { className: "selector-servicio", children: [_jsx("h3", { children: "Elige el servicio" }), _jsx("div", { className: "lista-servicios", children: servicios.map((s) => (_jsxs("button", { className: s.id === servicioSeleccionado ? 'activo' : '', onClick: () => onSeleccionar(s), children: [_jsx("strong", { children: s.nombre }), _jsxs("span", { children: [s.duracionMinutos, " min \u00B7 desde $", s.precioBase.toLocaleString()] })] }, s.id))) })] }));
}
