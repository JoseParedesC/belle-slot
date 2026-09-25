import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Store, MapPin, Phone, Mail, User, Palette, Check, ArrowRight } from 'lucide-react';
import { registrarNuevaEmpresa } from '../../services/api';
import { PALETAS_PRESET } from '../../utils/theme';

interface Props {
  onCerrar: () => void;
  onRegistrado?: () => void;
}

export function ModalRegistroEmpresa({ onCerrar, onRegistrado }: Props) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#d94676');
  const [colorSecundario, setColorSecundario] = useState('#8c1e40');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Sugerir slug automático al escribir el nombre
  const handleNombreChange = (val: string) => {
    setNombre(val);
    const sugerido = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(sugerido);
  };

  const seleccionarPreset = (p: typeof PALETAS_PRESET[0]) => {
    setColorPrimario(p.primary);
    setColorSecundario(p.secondary);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Por favor ingresa el nombre del salón');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await registrarNuevaEmpresa({
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        direccion: direccion.trim() || undefined,
        telefonoWhatsapp: telefonoWhatsapp.trim() || undefined,
        adminNombre: adminNombre.trim() || undefined,
        adminEmail: adminEmail.trim() || undefined,
      });

      if (onRegistrado) onRegistrado();
      onCerrar();

      if (res?.empresa?.slug) {
        navigate(`/${res.empresa.slug}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Error al registrar salón');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCerrar}>
      <div className="modal-container modal-registro-salon" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onCerrar}>
          <X size={18} />
        </button>

        <div className="modal-header-registro">
          <div className="modal-badge">
            <Store size={15} /> Nueva Empresa SaaS
          </div>
          <h2 className="modal-title">Registra tu Salón o Spa</h2>
          <p className="modal-subtitle">
            Crea el espacio digital para tu salón en segundos con identidad de marca y catálogo propio.
          </p>
        </div>

        {error && <div className="error-alert-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="form-registro-salon">
          <div className="form-row-grid">
            <div className="input-group">
              <label>Nombre del Salón *</label>
              <div className="input-with-icon">
                <Store size={16} />
                <input
                  type="text"
                  required
                  placeholder="Ej: Velvet Nails Studio"
                  value={nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Identificador Web (Slug URL) *</label>
              <div className="input-with-icon">
                <span className="input-prefix">/</span>
                <input
                  type="text"
                  required
                  placeholder="velvet-nails"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
              </div>
            </div>
          </div>

          <div className="form-row-grid">
            <div className="input-group">
              <label>Dirección Física</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input
                  type="text"
                  placeholder="Calle 100 # 15-20, Bogotá"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>WhatsApp / Teléfono</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={telefonoWhatsapp}
                  onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row-grid">
            <div className="input-group">
              <label>Nombre Administradora</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Correo Electrónico (Google)</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="admin@velvetnails.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Paleta de Color de Marca */}
          <div className="color-selection-section">
            <label className="section-label">
              <Palette size={15} /> Paleta de Color de la Marca
            </label>
            <div className="presets-chips-row">
              {PALETAS_PRESET.map((p) => {
                const activo = colorPrimario === p.primary;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`btn-preset-chip ${activo ? 'activo' : ''}`}
                    onClick={() => seleccionarPreset(p)}
                  >
                    <span
                      className="color-dot-indicator"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span>{p.nombre}</span>
                    {activo && <Check size={13} />}
                  </button>
                );
              })}
            </div>

            <div className="custom-color-inputs">
              <div className="custom-color-item">
                <span>Color Principal:</span>
                <input
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                />
                <code>{colorPrimario}</code>
              </div>
              <div className="custom-color-item">
                <span>Color Secundario:</span>
                <input
                  type="color"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                />
                <code>{colorSecundario}</code>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit-registro-salon" disabled={cargando}>
            <Sparkles size={16} />
            <span>{cargando ? 'Creando Salón...' : 'Crear Salón e Ingresar'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
