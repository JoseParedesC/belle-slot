import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar';
import { Reservar } from './pages/Reservar';
import { PortalEstilistas } from './pages/estilistas/PortalEstilistas';
import { MisCitas } from './pages/clientas/MisCitas';
import { Login } from './pages/admin/Login';
import { AdminCalendario } from './pages/admin/Calendario';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Reservar />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/calendario" element={<AdminCalendario />} />
      </Routes>
      <div className="app-root-wrapper">
        <Navbar />
        <div className="app-main-content">
          <Routes>
            <Route path="/" element={<Reservar />} />
            <Route path="/estilistas" element={<PortalEstilistas />} />
            <Route path="/mis-citas" element={<MisCitas />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/calendario" element={<AdminCalendario />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
