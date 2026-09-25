import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Store,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Scissors,
  Calendar,
  PlusCircle,
  Search,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { useEmpresa } from '../../context/EmpresaContext';
import { ModalRegistroEmpresa } from '../../components/saas/ModalRegistroEmpresa';

export function LandingSaaS() {
  const { empresas, recargarEmpresas } = useEmpresa();
  const [busqueda, setBusqueda] = useState('');
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);

  const empresasFiltradas = empresas.filter((emp) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.nombre.toLowerCase().includes(q) ||
      emp.slug.toLowerCase().includes(q) ||
      (emp.direccion && emp.direccion.toLowerCase().includes(q))
    );
  });

  return (
    <div className="suite-landing-container">
      {/* Hero Banner Suite */}
      <section className="suite-hero-section">
        <div className="suite-hero-badge">
          <Sparkles size={15} />
          <span>Belle Slot Suite · Red de Salones & Spas</span>
        </div>
        <h1 className="suite-hero-title">
          Encuentra tu Salón de Belleza o Administra tu Negocio
        </h1>
        <p className="suite-hero-subtitle">
          Selecciona cualquiera de nuestras empresas asociadas para consultar horarios,
          ver catálogos exclusivos y agendar tu cita en segundos.
        </p>

        {/* Barra de Filtro y Registro */}
        <div className="suite-controls-bar">
          <div className="suite-search-box">
            <Search size={18} className="suite-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre de salón o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-suite-register"
            onClick={() => setModalRegistroAbierto(true)}
          >
            <PlusCircle size={17} />
            <span>Registrar Nuevo Salón</span>
          </button>
        </div>
      </section>

      {/* Grid de Salones / Empresas */}
      <section className="suite-salones-section">
        <div className="suite-section-header">
          <div>
            <h2 className="suite-section-title">Salones Disponibles</h2>
            <p className="suite-section-subtitle">
              Mostrando {empresasFiltradas.length} {empresasFiltradas.length === 1 ? 'salón' : 'salones'} en la plataforma
            </p>
          </div>
        </div>

        <div className="suite-salones-grid">
          {empresasFiltradas.map((emp) => {
            const colorPrimario = emp.colorPrimario || '#d94676';
            const colorSecundario = emp.colorSecundario || '#8c1e40';

            return (
              <div key={emp.id} className="suite-salon-card">
                {/* Banner de Color de la Marca */}
                <div
                  className="salon-card-banner"
                  style={{
                    background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
                  }}
                >
                  <div className="salon-avatar-badge">
                    {emp.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="salon-plan-badge">
                    {emp.plan ? emp.plan.toUpperCase() : 'PRO'}
                  </span>
                </div>

                {/* Contenido de la Empresa */}
                <div className="salon-card-body">
                  <div className="salon-card-header-info">
                    <h3 className="salon-card-title">{emp.nombre}</h3>
                    <span className="salon-card-slug">/{emp.slug}</span>
                  </div>

                  <div className="salon-details-list">
                    {emp.direccion && (
                      <div className="salon-detail-item">
                        <MapPin size={15} style={{ color: colorPrimario }} />
                        <span>{emp.direccion}</span>
                      </div>
                    )}

                    <div className="salon-detail-item">
                      <Clock size={15} style={{ color: colorPrimario }} />
                      <span>
                        {emp.horarioApertura} a {emp.horarioCierre} hrs
                      </span>
                    </div>

                    {emp.telefonoWhatsapp && (
                      <div className="salon-detail-item">
                        <Phone size={15} style={{ color: colorPrimario }} />
                        <span>{emp.telefonoWhatsapp}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones para Ingresar a la Empresa */}
                  <div className="salon-card-actions">
                    <Link
                      to={`/${emp.slug}`}
                      className="btn-ingresar-salon"
                      style={{
                        backgroundColor: colorPrimario,
                        boxShadow: `0 4px 14px ${colorPrimario}40`,
                      }}
                    >
                      <Calendar size={16} />
                      <span>Reservar Cita</span>
                      <ArrowRight size={15} />
                    </Link>

                    <div className="salon-secondary-links">
                      <Link
                        to={`/${emp.slug}/estilistas`}
                        className="btn-salon-sublink"
                        title="Portal de Estilistas"
                      >
                        <Scissors size={14} />
                        <span>Agenda</span>
                      </Link>
                      <Link
                        to={`/${emp.slug}/mis-citas`}
                        className="btn-salon-sublink"
                        title="Consultar Mis Citas"
                      >
                        <Clock size={14} />
                        <span>Mis Citas</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {empresasFiltradas.length === 0 && (
          <div className="suite-empty-state">
            <Store size={48} className="empty-suite-icon" />
            <h3>No se encontraron salones</h3>
            <p>No hay empresas que coincidan con el término "{busqueda}".</p>
            <button
              type="button"
              className="btn-suite-register"
              onClick={() => setBusqueda('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </section>

      {/* Sección Informativa: Ventajas de la Suite SaaS */}
      <section className="suite-features-section">
        <h2 className="suite-features-title">¿Por qué unirse a la Suite Belle Slot?</h2>
        <div className="suite-features-grid">
          <div className="suite-feature-box">
            <div className="feature-box-icon" style={{ backgroundColor: '#fff2f6', color: '#d94676' }}>
              <Palette size={24} />
            </div>
            <h3>Marca y Paleta Personalizada</h3>
            <p>
              Cada salón cuenta con su propio subdominio o slug, colores de identidad,
              logo y catálogo de servicios exclusivo.
            </p>
          </div>

          <div className="suite-feature-box">
            <div className="feature-box-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <Calendar size={24} />
            </div>
            <h3>Agenda y Reservas en Tiempo Real</h3>
            <p>
              Gestión de disponibilidad por estilista, selección interactiva de diseños Nail Art
              y recordatorios automáticos.
            </p>
          </div>

          <div className="suite-feature-box">
            <div className="feature-box-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Seguridad Multi-Inquilino</h3>
            <p>
              Aislamiento seguro de datos por empresa, autenticación con Google y panel administrativo
              para supervisión total.
            </p>
          </div>
        </div>
      </section>

      {/* Modal de Registro de Nueva Empresa */}
      {modalRegistroAbierto && (
        <ModalRegistroEmpresa
          onCerrar={() => setModalRegistroAbierto(false)}
          onRegistrado={() => {
            recargarEmpresas();
            setModalRegistroAbierto(false);
          }}
        />
      )}
    </div>
  );
}
