import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Heart, Shield, Clock, MapPin, Phone, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import { Servicio, Configuracion } from '../types';
import { obtenerServicios, obtenerConfiguracion } from '../services/api';
import { CalendarioMensual } from '../components/calendario/CalendarioMensual';
import { ModalReserva } from '../components/modal-reserva/ModalReserva';
import { SelectorServicio } from '../components/selector-servicio/SelectorServicio';
import { useEmpresa } from '../context/EmpresaContext';

export function Reservar() {
  const { slug } = useParams<{ slug?: string }>();
  const { empresaActual } = useEmpresa();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | undefined>();
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(true);

  // Recargar servicios y configuración cada vez que cambia el salón activo o el slug de la ruta
  useEffect(() => {
    setCargandoServicios(true);
    obtenerConfiguracion().then(setConfig).catch(console.error);

    obtenerServicios()
      .then((data) => {
        setServicios(data || []);
        if (data && data.length > 0) {
          setServicioSeleccionado(data[0]);
        } else {
          setServicioSeleccionado(undefined);
        }
      })
      .catch(console.error)
      .finally(() => setCargandoServicios(false));
  }, [empresaActual?.id, empresaActual?.slug, slug]);

  const handleSeleccionarDia = (fechaStr: string) => {
    setDiaSeleccionado(fechaStr);
    setModalAbierto(true);
  };

  const nombreSalon = empresaActual?.nombre || config?.nombreNegocio || 'Belle Slot';
  const direccionSalon = empresaActual?.direccion || config?.direccion || 'Centro Comercial Plaza Belle, Local 204';
  const telWhatsapp = empresaActual?.telefonoWhatsapp || config?.telefonoWhatsapp;
  const diasAtencion = empresaActual?.diasAtencion || config?.diasAtencion;
  const horaApertura = empresaActual?.horarioApertura || config?.horarioApertura || '09:00';
  const horaCierre = empresaActual?.horarioCierre || config?.horarioCierre || '18:00';

  return (
    <div className="pagina-principal-layout">
      {/* Hero Header */}
      <section className="hero-salon-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> Experiencia & Belleza de Uñas
          </div>
          <h1 className="hero-title">
            Reserva tu Cita en <span className="highlight-text">{nombreSalon}</span>
          </h1>
          <p className="hero-description">
            Elige el día que prefieras en nuestro calendario mensual. Al hacer clic en una fecha,
            se abrirá tu asistente para seleccionar horario, tratamiento y confirmar en segundos.
          </p>

          <div className="hero-features-bar">
            <div className="feature-item">
              <Heart size={18} className="feature-icon" />
              <span>Atención Personalizada</span>
            </div>
            <div className="feature-item">
              <Shield size={18} className="feature-icon" />
              <span>Higiene & Esterilización</span>
            </div>
            <div className="feature-item">
              <Clock size={18} className="feature-icon" />
              <span>Puntualidad Garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="main-booking-container">
        {/* Selector de servicio destacado */}
        {!cargandoServicios && servicios.length > 0 && (
          <section className="services-selection-section">
            <SelectorServicio
              servicios={servicios}
              servicioSeleccionado={servicioSeleccionado?.id}
              onSeleccionar={setServicioSeleccionado}
            />
          </section>
        )}

        {/* Sección del Calendario Mensual Grande */}
        <section className="calendar-main-section">
          <div className="section-calendar-header">
            <div className="title-with-pill">
              <CalendarIcon size={22} className="text-accent" />
              <h2>Calendario de Disponibilidad</h2>
            </div>
            <p className="calendar-prompt-subtext">
              {servicioSeleccionado
                ? `Mostrando disponibilidad para "${servicioSeleccionado.nombre}". Haz clic en el día deseado para reservar tu turno.`
                : 'Selecciona cualquier día del mes para ver los turnos disponibles y abrir el formulario de reserva.'}
            </p>
          </div>

          <CalendarioMensual
            diaSeleccionado={diaSeleccionado || undefined}
            onSeleccionarDia={handleSeleccionarDia}
          />
        </section>

        {/* Info Salon Footer (Leído desde la Base de Datos) */}
        <section className="salon-info-strip">
          <div className="info-strip-card">
            <MapPin size={22} className="strip-icon" />
            <div>
              <strong>Ubicación de {nombreSalon}</strong>
              <p>{direccionSalon}</p>
            </div>
          </div>

          <div className="info-strip-card">
            <Clock size={22} className="strip-icon" />
            <div>
              <strong>Horario de Atención</strong>
              <p>
                {diasAtencion && diasAtencion.length > 0
                  ? `${diasAtencion[0]} a ${diasAtencion[diasAtencion.length - 1]}`
                  : 'Lunes a Sábado'}{' '}
                · {horaApertura} a {horaCierre} hrs
              </p>
            </div>
          </div>

          <div className="info-strip-card">
            <Phone size={22} className="strip-icon" />
            <div>
              <strong>Consultas por WhatsApp</strong>
              {telWhatsapp ? (
                <a
                  href={`https://wa.me/${telWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hola, me comunico desde el sitio web de ${nombreSalon}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="whatsapp-contact-link"
                >
                  <MessageCircle size={15} />
                  <span>{telWhatsapp}</span>
                </a>
              ) : (
                <p>No configurado</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal de Reserva que aparece al seleccionar un día */}
      {modalAbierto && diaSeleccionado && (
        <ModalReserva
          fecha={diaSeleccionado}
          servicios={servicios}
          servicioInicial={servicioSeleccionado}
          onCerrar={() => setModalAbierto(false)}
          onReservaExitosa={() => {
            // Se mantiene abierto en el voucher de confirmación
          }}
        />
      )}
    </div>
  );
}
