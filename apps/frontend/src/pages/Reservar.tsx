import { useEffect, useState } from 'react';
import { Servicio, Diseno, Configuracion } from '../types';
import { obtenerServicios, obtenerDisenos, obtenerConfiguracion, crearReserva } from '../services/api';
import { SelectorServicio } from '../components/selector-servicio/SelectorServicio';
import { SelectorDiseno } from '../components/selector-diseno/SelectorDiseno';
import { BannerAvisoPrecio } from '../components/banner-aviso-precio/BannerAvisoPrecio';
import { Calendario } from '../components/calendario/Calendario';
import { ResumenReserva } from '../components/resumen-reserva/ResumenReserva';

export function Reservar() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);

  const [servicio, setServicio] = useState<Servicio>();
  const [diseno, setDiseno] = useState<Diseno>();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [confirmando, setConfirmando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerServicios().then(setServicios);
    obtenerConfiguracion().then(setConfig);
  }, []);

  useEffect(() => {
    if (!servicio) return;
    setDiseno(undefined);
    obtenerDisenos(servicio.id).then(setDisenos);
  }, [servicio]);

  async function confirmar() {
    if (!servicio || !fecha || !hora || !nombre || !telefono) return;
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
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo completar la reserva');
    } finally {
      setConfirmando(false);
    }
  }

  if (reservaConfirmada) {
    return (
      <div className="pagina-reservar confirmada">
        <h2>¡Reserva confirmada! 🎉</h2>
        <p>Te enviaremos un recordatorio antes de tu cita.</p>
      </div>
    );
  }

  return (
    <div className="pagina-reservar">
      <h1>Reserva tu cita</h1>

      <SelectorServicio
        servicios={servicios}
        servicioSeleccionado={servicio?.id}
        onSeleccionar={setServicio}
      />

      {servicio && (
        <SelectorDiseno
          disenos={disenos}
          disenoSeleccionado={diseno?.id}
          onSeleccionar={setDiseno}
        />
      )}

      {servicio && diseno && config?.textoBannerPrecio && (
        <BannerAvisoPrecio texto={config.textoBannerPrecio} />
      )}

      {servicio && (
        <Calendario
          servicioId={servicio.id}
          onSeleccionarFechaHora={(f, h) => {
            setFecha(f);
            setHora(h);
          }}
        />
      )}

      {servicio && fecha && hora && (
        <>
          <ResumenReserva servicio={servicio} diseno={diseno} fecha={fecha} hora={hora} />

          <div className="datos-cliente">
            <h3>Tus datos</h3>
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input placeholder="Teléfono (WhatsApp)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input placeholder="Email (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {error && <p className="error">{error}</p>}

          <button disabled={confirmando} onClick={confirmar}>
            {confirmando ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
        </>
      )}
    </div>
  );
}
