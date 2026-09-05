import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ResumenReserva({ servicio, diseno, fecha, hora }) {
    const precioFinal = servicio.precioBase + (diseno?.incrementoPrecio || 0);
    return (_jsxs("div", { className: "resumen-reserva", children: [_jsx("h3", { children: "Resumen de tu reserva" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("strong", { children: "Servicio:" }), " ", servicio.nombre] }), _jsxs("li", { children: [_jsx("strong", { children: "Dise\u00F1o:" }), " ", diseno ? diseno.nombre : 'No seleccionado'] }), _jsxs("li", { children: [_jsx("strong", { children: "Fecha:" }), " ", fecha] }), _jsxs("li", { children: [_jsx("strong", { children: "Hora:" }), " ", hora] }), _jsxs("li", { children: [_jsx("strong", { children: "Precio estimado:" }), " $", precioFinal.toLocaleString()] })] })] }));
}
