import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Store, Check, Sparkles } from 'lucide-react';
import { useEmpresa } from '../../context/EmpresaContext';

export function TenantSwitcher() {
  const { empresaActual, empresas, cambiarEmpresa } = useEmpresa();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  return (
    <div className="tenant-switcher-container" ref={menuRef}>
      <button
        type="button"
        className={`tenant-switcher-btn ${abierto ? 'activo' : ''}`}
        onClick={() => setAbierto(!abierto)}
        title="Cambiar de salón / empresa"
      >
        <span
          className="tenant-icon-badge"
          style={{
            backgroundColor: empresaActual?.colorPrimario || 'var(--primary)',
            color: '#ffffff',
          }}
        >
          <Store size={13} />
        </span>
        <div className="tenant-info-compact">
          <span className="tenant-label-tag">Salón Activo</span>
          <span className="tenant-name-active">{empresaActual?.nombre || 'Belle Slot'}</span>
        </div>
        <ChevronDown size={14} className={`tenant-chevron ${abierto ? 'rotado' : ''}`} />
      </button>

      {abierto && (
        <div className="tenant-switcher-dropdown">
          <div className="tenant-dropdown-header">
            <span>Salones Disponibles</span>
            <span className="tenant-count-badge">{empresas.length}</span>
          </div>

          <div className="tenant-list">
            {empresas.map((emp) => {
              const seleccionado = emp.slug === empresaActual?.slug;
              const colorMarca = emp.colorPrimario || '#d94676';
              return (
                <button
                  key={emp.id}
                  type="button"
                  className={`tenant-item-btn ${seleccionado ? 'seleccionado' : ''}`}
                  onClick={() => {
                    cambiarEmpresa(emp.slug);
                    setAbierto(false);
                  }}
                >
                  <div
                    className="tenant-item-avatar"
                    style={{
                      background: `linear-gradient(135deg, ${colorMarca} 0%, ${emp.colorSecundario || colorMarca} 100%)`,
                    }}
                  >
                    {emp.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="tenant-item-details">
                    <div className="tenant-item-name-row">
                      <span className="tenant-item-name">{emp.nombre}</span>
                      {seleccionado && <Check size={14} className="tenant-check-icon" />}
                    </div>
                    {emp.direccion && (
                      <span className="tenant-item-address">{emp.direccion}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="tenant-dropdown-footer">
            <Link
              to="/"
              className="tenant-footer-link"
              onClick={() => setAbierto(false)}
            >
              <Store size={14} />
              <span>Ver Directorio Completo (Suite)</span>
            </Link>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                padding: '0.25rem 0.4rem',
              }}
            >
              <Sparkles size={12} color="var(--primary)" />
              <span>Cada salón aplica su propia paleta de marca</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
