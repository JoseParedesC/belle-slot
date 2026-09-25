import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { Navbar } from './components/navbar/Navbar';
import { LandingSaaS } from './pages/saas/LandingSaaS';
import { Reservar } from './pages/Reservar';
import { PortalEstilistas } from './pages/estilistas/PortalEstilistas';
import { MisCitas } from './pages/clientas/MisCitas';
import { Login } from './pages/admin/Login';
import { AdminCalendario } from './pages/admin/Calendario';

export default function App() {
  return (
    <BrowserRouter>
      <EmpresaProvider>
        <div className="app-root-wrapper">
          <Navbar />
          <div className="app-main-content">
            <Routes>
              {/* Ruta base /: Suite Hub que redirecciona a las diferentes empresas */}
              <Route path="/" element={<LandingSaaS />} />
              <Route path="/explorar" element={<LandingSaaS />} />
              <Route path="/salones" element={<LandingSaaS />} />

              {/* Rutas estándar de contingencia */}
              <Route path="/estilistas" element={<PortalEstilistas />} />
              <Route path="/mis-citas" element={<MisCitas />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/calendario" element={<AdminCalendario />} />
              <Route path="/admin/gestion-citas" element={<AdminCalendario />} />

              {/* Rutas con slug del salón SaaS */}
              <Route path="/:slug" element={<Reservar />} />
              <Route path="/:slug/estilistas" element={<PortalEstilistas />} />
              <Route path="/:slug/mis-citas" element={<MisCitas />} />
              <Route path="/:slug/admin/login" element={<Login />} />
              <Route path="/:slug/admin/calendario" element={<AdminCalendario />} />
              <Route path="/:slug/admin/gestion-citas" element={<AdminCalendario />} />
            </Routes>
          </div>
        </div>
      </EmpresaProvider>
    </BrowserRouter>
  );
}
