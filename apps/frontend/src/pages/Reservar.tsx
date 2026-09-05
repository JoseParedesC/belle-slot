import { useEffect, useState } from 'react';
import { Sparkles, Heart, Shield, Clock, MapPin, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { Servicio } from '../types';
import { obtenerServicios } from '../services/api';
import { CalendarioMensual } from '../components/calendario/CalendarioMensual';
import { ModalReserva } from '../components/modal-reserva/ModalReserva';
import { SelectorServicio } from '../components/selector-servicio/SelectorServicio';

export function Reservar() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | undefined>();
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(true);

  useEffect(() => {
    obtenerServicios()
      .then((data) => {
        setServicios(data || []);
        if (data && data.length > 0) {
          setServicioSeleccionado(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setCargandoServicios(false));
  }, []);

  const handleSeleccionarDia = (fechaStr: string) => {
    setDiaSeleccionado(fechaStr);
    setModalAbierto(true);
  };

  return (
    <div className="pagina-principal-layout">
      {/* Hero Header */}
      <section className="hero-salon-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> Experiencia & Belleza de Uñas
          </div>
          <h1 className="hero-title">
            Reserva tu Cita en <span className="highlight-text">Belle Slot</span>
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

        {/* Info Salon Footer */}
        <section className="salon-info-strip">
          <div className="info-strip-card">
            <MapPin size={22} className="strip-icon" />
            <div>
              <strong>Ubicación del Studio</strong>
              <p>Centro Comercial Plaza Belle, Local 204</p>
            </div>
          </div>

          <div className="info-strip-card">
            <Clock size={22} className="strip-icon" />
            <div>
              <strong>Horario de Atención</strong>
              <p>Lunes a Sábado · 09:00 AM a 06:00 PM</p>
            </div>
          </div>

          <div className="info-strip-card">
            <Phone size={22} className="strip-icon" />
            <div>
              <strong>Consultas por WhatsApp</strong>
              <p>+57 (300) 123-4567</p>
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
