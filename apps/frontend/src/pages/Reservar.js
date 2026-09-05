import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { obtenerServicios, obtenerDisenos, obtenerConfiguracion, crearReserva } from '../services/api';
import { SelectorServicio } from '../components/selector-servicio/SelectorServicio';
import { SelectorDiseno } from '../components/selector-diseno/SelectorDiseno';
import { BannerAvisoPrecio } from '../components/banner-aviso-precio/BannerAvisoPrecio';
import { Calendario } from '../components/calendario/Calendario';
import { ResumenReserva } from '../components/resumen-reserva/ResumenReserva';
export function Reservar() {
    const [servicios, setServicios] = useState([]);
    const [disenos, setDisenos] = useState([]);
    const [config, setConfig] = useState(null);
    const [servicio, setServicio] = useState();
    const [diseno, setDiseno] = useState();
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [reservaConfirmada, setReservaConfirmada] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        obtenerServicios().then(setServicios);
        obtenerConfiguracion().then(setConfig);
    }, []);
    useEffect(() => {
        if (!servicio)
            return;
        setDiseno(undefined);
        obtenerDisenos(servicio.id).then(setDisenos);
    }, [servicio]);
    async function confirmar() {
        if (!servicio || !fecha || !hora || !nombre || !telefono)
            return;
        setConfirmando(true);
        setError('');
        try {
            const reserva = await crearReserva({
                cliente: { nombre, telefono, email: email || undefined },
                servicio_id: servicio.id,
                diseno_id: diseno?.id,
                fecha,
                hora_inicio: hora,
            });
            setReservaConfirmada(reserva);
        }
        catch (err) {
            setError(err?.response?.data?.error || 'No se pudo completar la reserva');
        }
        finally {
            setConfirmando(false);
        }
    }
    if (reservaConfirmada) {
        return (_jsxs("div", { className: "pagina-reservar confirmada", children: [_jsx("h2", { children: "\u00A1Reserva confirmada! \uD83C\uDF89" }), _jsx("p", { children: "Te enviaremos un recordatorio antes de tu cita." })] }));
    }
    return (_jsxs("div", { className: "pagina-reservar", children: [_jsx("h1", { children: "Reserva tu cita" }), _jsx(SelectorServicio, { servicios: servicios, servicioSeleccionado: servicio?.id, onSeleccionar: setServicio }), servicio && (_jsx(SelectorDiseno, { disenos: disenos, disenoSeleccionado: diseno?.id, onSeleccionar: setDiseno })), servicio && diseno && config?.textoBannerPrecio && (_jsx(BannerAvisoPrecio, { texto: config.textoBannerPrecio })), servicio && (_jsx(Calendario, { servicioId: servicio.id, onSeleccionarFechaHora: (f, h) => {
                    setFecha(f);
                    setHora(h);
                } })), servicio && fecha && hora && (_jsxs(_Fragment, { children: [_jsx(ResumenReserva, { servicio: servicio, diseno: diseno, fecha: fecha, hora: hora }), _jsxs("div", { className: "datos-cliente", children: [_jsx("h3", { children: "Tus datos" }), _jsx("input", { placeholder: "Nombre", value: nombre, onChange: (e) => setNombre(e.target.value) }), _jsx("input", { placeholder: "Tel\u00E9fono (WhatsApp)", value: telefono, onChange: (e) => setTelefono(e.target.value) }), _jsx("input", { placeholder: "Email (opcional)", value: email, onChange: (e) => setEmail(e.target.value) })] }), error && _jsx("p", { className: "error", children: error }), _jsx("button", { disabled: confirmando, onClick: confirmar, children: confirmando ? 'Confirmando...' : 'Confirmar reserva' })] }))] }));
}
