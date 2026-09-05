import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Reservar } from './pages/Reservar';
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
    </BrowserRouter>
  );
}
