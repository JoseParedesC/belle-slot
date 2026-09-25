import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Empresa } from '../types';
import {
  obtenerEmpresasSaaS,
  obtenerEmpresaPorSlug,
  obtenerTenantSlug,
  guardarTenantSlug,
} from '../services/api';
import { aplicarTema } from '../utils/theme';

const DEFAULT_BELLE: Empresa = {
  id: 'empresa-belle-slot',
  nombre: 'Belle Slot Studio',
  slug: 'belle-slot',
  direccion: 'Centro Comercial Plaza Belle, Local 204',
  telefonoWhatsapp: '+57 300 123 4567',
  emailContacto: 'contacto@belleslot.com',
  horarioApertura: '09:00',
  horarioCierre: '18:00',
  diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  duracionBloqueMinutos: 30,
  horasAnticipacionCancelacion: 12,
  textoBannerPrecio: 'El valor mostrado es el precio base del servicio. El costo final puede variar según el diseño.',
  colorPrimario: '#d94676',
  colorSecundario: '#8c1e40',
  colorAcento: '#c29057',
  colorFondo: '#faf6f8',
};

const DEFAULT_GLAMOUR: Empresa = {
  id: 'empresa-glamour-nails',
  nombre: 'Glamour Nails Spa',
  slug: 'glamour-nails',
  direccion: 'Avenida Principal #45-12, Zona Rosa',
  telefonoWhatsapp: '+57 315 999 8877',
  emailContacto: 'hola@glamournails.com',
  horarioApertura: '10:00',
  horarioCierre: '19:00',
  diasAtencion: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  duracionBloqueMinutos: 45,
  horasAnticipacionCancelacion: 24,
  textoBannerPrecio: 'Todos nuestros servicios en Glamour Spa incluyen exfoliación aromática de cortesía.',
  colorPrimario: '#7c3aed',
  colorSecundario: '#5b21b6',
  colorAcento: '#06b6d4',
  colorFondo: '#f8f7fc',
};

const PRESETS: Record<string, Empresa> = {
  'belle-slot': DEFAULT_BELLE,
  'glamour-nails': DEFAULT_GLAMOUR,
};

function resolverSlugDeRuta(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const knownPrefixes = ['estilistas', 'mis-citas', 'admin', 'explorar', 'salones', 'registro-salon'];

  if (parts.length > 0 && !knownPrefixes.includes(parts[0])) {
    return parts[0].toLowerCase();
  }
  return 'belle-slot';
}

interface EmpresaContextType {
  empresaActual: Empresa;
  empresas: Empresa[];
  cargando: boolean;
  cambiarEmpresa: (slug: string) => void;
  recargarEmpresas: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaActual: DEFAULT_BELLE,
  empresas: [DEFAULT_BELLE, DEFAULT_GLAMOUR],
  cargando: false,
  cambiarEmpresa: () => {},
  recargarEmpresas: async () => {},
});

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const slugInicial = typeof window !== 'undefined' ? resolverSlugDeRuta(window.location.pathname) : 'belle-slot';
  const inicialEmpresa = PRESETS[slugInicial] || DEFAULT_BELLE;

  const [empresas, setEmpresas] = useState<Empresa[]>([DEFAULT_BELLE, DEFAULT_GLAMOUR]);
  const [empresaActual, setEmpresaActual] = useState<Empresa>(inicialEmpresa);
  const [cargando, setCargando] = useState(false);

  // Cargar lista de salones registrados desde el backend
  const recargarEmpresas = useCallback(async () => {
    try {
      const data = await obtenerEmpresasSaaS();
      if (Array.isArray(data) && data.length > 0) {
        setEmpresas(data);
      }
    } catch (err) {
      console.warn('Backend no disponible para listar salones SaaS, usando defaults');
    }
  }, []);

  useEffect(() => {
    recargarEmpresas();
  }, [recargarEmpresas]);

  // Aplicar tema dinámico en CSS cuando cambia el salón activo
  useEffect(() => {
    aplicarTema(empresaActual);
  }, [empresaActual]);

  // Detectar el slug de la URL cuando cambia la ruta
  useEffect(() => {
    const slug = resolverSlugDeRuta(location.pathname);
    guardarTenantSlug(slug);

    // 1. Si existe un preset local, aplicarlo inmediatamente para que no haya parpadeo
    if (PRESETS[slug]) {
      setEmpresaActual(PRESETS[slug]);
    }

    // 2. Si ya está cargado en la lista de empresas en memoria, usarlo
    const enMemoria = empresas.find((e) => e.slug === slug);
    if (enMemoria) {
      setEmpresaActual(enMemoria);
      return;
    }

    // 3. Consultar al backend para tener los datos más frescos
    obtenerEmpresaPorSlug(slug)
      .then((emp) => {
        if (emp) {
          setEmpresaActual(emp);
        }
      })
      .catch(() => {
        // Mantiene el preset
      });
  }, [location.pathname, empresas]);

  const cambiarEmpresa = (nuevoSlug: string) => {
    guardarTenantSlug(nuevoSlug);
    const nueva = empresas.find((e) => e.slug === nuevoSlug);
    if (nueva) {
      setEmpresaActual(nueva);
    }

    const pathParts = location.pathname.split('/').filter(Boolean);
    const knownPrefixes = ['estilistas', 'mis-citas', 'admin'];

    if (pathParts.length >= 2 && knownPrefixes.includes(pathParts[1])) {
      navigate(`/${nuevoSlug}/${pathParts.slice(1).join('/')}`);
    } else if (pathParts.length === 1 && knownPrefixes.includes(pathParts[0])) {
      navigate(`/${nuevoSlug}/${pathParts[0]}`);
    } else {
      navigate(`/${nuevoSlug}`);
    }
  };

  return (
    <EmpresaContext.Provider
      value={{
        empresaActual,
        empresas,
        cargando,
        cambiarEmpresa,
        recargarEmpresas,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};

