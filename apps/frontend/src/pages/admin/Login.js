import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
export function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await login(usuario, password);
            navigate('/admin/calendario');
        }
        catch {
            setError('Usuario o contraseña incorrectos');
        }
    }
    return (_jsxs("div", { className: "pagina-reservar", children: [_jsx("h1", { children: "Ingreso administrador" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("input", { placeholder: "Usuario", value: usuario, onChange: (e) => setUsuario(e.target.value) }), _jsx("input", { placeholder: "Contrase\u00F1a", type: "password", value: password, onChange: (e) => setPassword(e.target.value) }), error && _jsx("p", { className: "error", children: error }), _jsx("button", { type: "submit", children: "Ingresar" })] })] }));
}
