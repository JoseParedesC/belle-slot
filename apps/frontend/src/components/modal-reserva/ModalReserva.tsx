import React, { useState } from 'react';
import { Servicio, Diseno } from '../../types';
import { api } from '../../services/api';

interface ModalReservaProps {
  isOpen: boolean;
  onClose: () => void;
  servicioSeleccionado: Servicio | null;
  disenoSeleccionado: Diseno | null;
  fecha: string | null;
  hora: string | null;
  onSuccess?: () => void;
}

export const ModalReserva: React.FC<ModalReservaProps> = ({
  isOpen,
  onClose,
  servicioSeleccionado,
  disenoSeleccionado,
  fecha,
  hora,
  onSuccess,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado || !fecha || !hora) {
      setError('Por favor completa todos los campos requeridos');
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
        email,
      },
      notas,
    };

    // Cadena de promesa corregida (TS1345 resuelto: un solo .then)
    api.crearReserva(payload)
      .then((res) => {
        if (res) {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
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
    (servicioSeleccionado?.precio || 0) + (disenoSeleccionado?.precio || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Confirmar Reserva
          </h3>
          <button
            onClick={onClose}
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
            <p><strong>Servicio:</strong> {servicioSeleccionado?.nombre}</p>
            {disenoSeleccionado && (
              <p><strong>Diseño:</strong> {disenoSeleccionado.nombre}</p>
            )}
            <p><strong>Fecha y Hora:</strong> {fecha} a las {hora}</p>
            <p className="mt-1 font-semibold text-pink-600">
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
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Alergias, detalles especiales o preferencias..."
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
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