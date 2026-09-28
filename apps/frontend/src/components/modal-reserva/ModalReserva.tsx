import React, { useState, useEffect } from 'react';
import { Servicio, Diseno } from '../../types';
import { api } from '../../services/api';

interface ModalReservaProps {
  fecha: string;
  servicios?: Servicio[];
  servicioInicial?: Servicio | null;
  disenoInicial?: Diseno | null;
  horaInicial?: string | null;
  onCerrar: () => void;
  onReservaExitosa: () => void;
}

export const ModalReserva: React.FC<ModalReservaProps> = ({
  fecha,
  servicios = [],
  servicioInicial = null,
  disenoInicial = null,
  horaInicial = null,
  onCerrar,
  onReservaExitosa,
}) => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(servicioInicial);
  const [disenoSeleccionado, setDisenoSeleccionado] = useState<Diseno | null>(disenoInicial);
  const [hora, setHora] = useState<string>(horaInicial || '10:00');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (servicioInicial) {
      setServicioSeleccionado(servicioInicial);
    }
  }, [servicioInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado || !fecha || !hora) {
      setError('Por favor selecciona un servicio, fecha y hora.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      servicioId: servicioSeleccionado.id,
      disenoId: disenoSeleccionado ? disenoSeleccionado.id : undefined,
      fecha,
      hora,
      cliente: {
        nombre,
        telefono,
        email: email || undefined,
      },
      notas,
    };

    // Llamada directa usando la instancia Axios y un solo .then() sin tipos any implícitos
    api.post('/reservas', payload)
      .then((res: { data: any }) => {
        if (res.data) {
          onReservaExitosa();
          onCerrar();
        }
      })
      .catch((err: any) => {
        console.error('Error al crear la reserva:', err);
        setError(err?.response?.data?.message || err?.message || 'Error al procesar la reserva. Intenta de nuevo.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const precioTotal =
    (servicioSeleccionado?.precioBase || 0) + (disenoSeleccionado?.precioBase || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Confirmar Reserva
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            {servicios.length > 0 && !servicioInicial ? (
              <div className="mb-2">
                <label className="block font-medium text-gray-700">Servicio *</label>
                <select
                  required
                  value={servicioSeleccionado?.id || ''}
                  onChange={(e) => {
                    const sel = servicios.find((s) => s.id === e.target.value) || null;
                    setServicioSeleccionado(sel);
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} - ${s.precioBase?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p><strong>Servicio:</strong> {servicioSeleccionado?.nombre}</p>
            )}

            {disenoSeleccionado && (
              <p><strong>Diseño:</strong> {disenoSeleccionado.nombre}</p>
            )}
            <p><strong>Fecha:</strong> {fecha}</p>
            <div className="mt-2">
              <label className="block text-xs font-semibold uppercase text-gray-600">Hora *</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <p className="mt-2 font-semibold text-pink-600">
              Total estimado: ${precioTotal.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Ej. María Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Ej. +57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas adicionales
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Alergias, detalles especiales o preferencias..."
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onCerrar}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};