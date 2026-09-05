import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Reservar } from './pages/Reservar';
import { Login } from './pages/admin/Login';
import { AdminCalendario } from './pages/admin/Calendario';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Reservar, {}) }), _jsx(Route, { path: "/admin/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/admin/calendario", element: _jsx(AdminCalendario, {}) })] }) }));
}
