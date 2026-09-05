import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SelectorDiseno({ disenos, disenoSeleccionado, onSeleccionar }) {
    return (_jsxs("div", { className: "selector-diseno", children: [_jsx("h3", { children: "Elige el dise\u00F1o" }), _jsx("div", { className: "lista-disenos", children: disenos.map((d) => (_jsxs("button", { className: d.id === disenoSeleccionado ? 'activo' : '', onClick: () => onSeleccionar(d), children: [_jsx("strong", { children: d.nombre }), d.incrementoPrecio > 0 && _jsxs("span", { children: ["+$", d.incrementoPrecio.toLocaleString()] })] }, d.id))) })] }));
}
