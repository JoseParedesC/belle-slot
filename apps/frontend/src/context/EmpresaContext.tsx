import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Empresa } from '../types';
import {
  obtenerEmpresasSaaS,
  obtenerEmpresaPorSlug,
  obtenerTenantSlug,
  guardarTenantSlug,
} from '../services/api';

const DEFAULT_EMPRESA: Empresa = {
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
};

interface EmpresaContextType {
  empresaActual: Empresa;
  empresas: Empresa[];
  cargando: boolean;
  cambiarEmpresa: (slug: string) => void;
  recargarEmpresas: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaActual: DEFAULT_EMPRESA,
  empresas: [DEFAULT_EMPRESA],
  cargando: false,
  cambiarEmpresa: () => {},
  recargarEmpresas: async () => {},
});

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([DEFAULT_EMPRESA]);
  const [empresaActual, setEmpresaActual] = useState<Empresa>(DEFAULT_EMPRESA);
  const [cargando, setCargando] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cargar lista de salones registrados
  const recargarEmpresas = useCallback(async () => {
    try {
      const data = await obtenerEmpresasSaaS();
      if (Array.isArray(data) && data.length > 0) {
        setEmpresas(data);
      }
    } catch (err) {
      console.warn('Backend aún no disponible para listar salones SaaS, usando defaults');
    }
  }, []);

  useEffect(() => {
    recargarEmpresas();
  }, [recargarEmpresas]);

  // Detectar el slug de la URL o usar el guardado
  useEffect(() => {
    const detectarYEstablecerEmpresa = async () => {
      try {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const knownPrefixes = ['estilistas', 'mis-citas', 'admin', 'explorar', 'salones', 'registro-salon'];

        let slug = obtenerTenantSlug() || 'belle-slot';

        // Si el primer segmento de la URL no es una ruta fija del sistema, es el slug del salón
        if (pathSegments.length > 0 && !knownPrefixes.includes(pathSegments[0])) {
          slug = pathSegments[0].toLowerCase();
        }

        guardarTenantSlug(slug);

        // Si ya está en la lista en memoria, úsalo inmediatamente
        const enMemoria = empresas.find((e) => e.slug === slug);
        if (enMemoria) {
          setEmpresaActual(enMemoria);
          return;
        }

        // Si no, intentar consultar al backend
        const emp = await obtenerEmpresaPorSlug(slug);
        if (emp) {
          setEmpresaActual(emp);
        }
      } catch (err) {
        console.warn('No se pudo resolver la empresa desde el backend, manteniendo salón por defecto.');
      }
    };

    detectarYEstablecerEmpresa();
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

