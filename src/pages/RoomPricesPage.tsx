import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Room } from '../types/room';
import type { RoomPrice } from '../types/roomPrice';

const tiposHabitacion = ['Individual', 'Doble', 'Triple', 'Suite'];

export function RoomPricesPage() {
  const [precios, setPrecios] = useState<RoomPrice[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);

  const [modoPrecio, setModoPrecio] = useState<'TIPO' | 'HABITACION'>('TIPO');
  const [tipoHabitacion, setTipoHabitacion] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [precio, setPrecio] = useState('');
  const [vigenteDesde, setVigenteDesde] = useState('');
  const [vigenteHasta, setVigenteHasta] = useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [preciosResponse, habitacionesResponse] = await Promise.all([
        api.get<ApiResponse<RoomPrice[]>>('/room-prices'),
        api.get<ApiResponse<Room[]>>('/rooms'),
      ]);

      setPrecios(preciosResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
    } catch {
      setError('No se pudieron cargar los precios.');
    } finally {
      setCargando(false);
    }
  }

  async function crearPrecio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (modoPrecio === 'TIPO' && !tipoHabitacion) {
      setError('El tipo de habitación es obligatorio.');
      return;
    }

    if (modoPrecio === 'HABITACION' && !habitacionId) {
      setError('La habitación es obligatoria.');
      return;
    }

    if (!precio || Number(precio) <= 0) {
      setError('El precio debe ser mayor a 0.');
      return;
    }

    if (!vigenteDesde) {
      setError('La fecha vigente desde es obligatoria.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/room-prices', {
        tipoHabitacion: modoPrecio === 'TIPO' ? tipoHabitacion : undefined,
        habitacionId: modoPrecio === 'HABITACION' ? habitacionId : undefined,
        precio: Number(precio),
        vigenteDesde,
        vigenteHasta: vigenteHasta || undefined,
      });

      setTipoHabitacion('');
      setHabitacionId('');
      setPrecio('');
      setVigenteDesde('');
      setVigenteHasta('');

      await cargarDatos();
    } catch {
      setError('No se pudo crear el precio.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarPrecio(id: string) {
    const confirmar = confirm('¿Eliminar este precio?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/room-prices/${id}`);

      await cargarDatos();
    } catch {
      setError('No se pudo eliminar el precio.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Precios de habitaciones</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Precios de habitaciones</h2>

      <CollapsibleForm title="Nuevo precio">
        <form onSubmit={crearPrecio}>

        <div>
          <label htmlFor="modoPrecio">Aplicar precio a</label>
          <select
            id="modoPrecio"
            value={modoPrecio}
            onChange={(event) =>
              setModoPrecio(event.target.value as 'TIPO' | 'HABITACION')
            }
          >
            <option value="TIPO">Tipo de habitación</option>
            <option value="HABITACION">Habitación específica</option>
          </select>
        </div>

        {modoPrecio === 'TIPO' ? (
          <div>
            <label htmlFor="tipoHabitacion">Tipo de habitación</label>
            <select
              id="tipoHabitacion"
              value={tipoHabitacion}
              onChange={(event) => setTipoHabitacion(event.target.value)}
            >
              <option value="">Seleccionar tipo</option>

              {tiposHabitacion.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="habitacionId">Habitación</label>
            <select
              id="habitacionId"
              value={habitacionId}
              onChange={(event) => setHabitacionId(event.target.value)}
            >
              <option value="">Seleccionar habitación</option>

              {habitaciones.map((habitacion) => (
                <option key={habitacion.id} value={habitacion.id}>
                  {habitacion.numero} - {habitacion.tipo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="precio">Precio</label>
          <input
            id="precio"
            type="number"
            min="1"
            value={precio}
            onChange={(event) => setPrecio(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="vigenteDesde">Vigente desde</label>
          <input
            id="vigenteDesde"
            type="date"
            value={vigenteDesde}
            onChange={(event) => setVigenteDesde(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="vigenteHasta">Vigente hasta opcional</label>
          <input
            id="vigenteHasta"
            type="date"
            value={vigenteHasta}
            onChange={(event) => setVigenteHasta(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear precio'}
        </button>
      </form>
    </CollapsibleForm>
      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {precios.length === 0 ? (
        <p>No hay precios cargados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Aplicación</th>
              <th>Precio</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {precios.map((precioHabitacion) => (
              <tr key={precioHabitacion.id}>
                <td>
                  {precioHabitacion.habitacion
                    ? `Habitación ${precioHabitacion.habitacion.numero}`
                    : `Tipo ${precioHabitacion.tipoHabitacion}`}
                </td>
                <td>${precioHabitacion.precio}</td>
                <td>{precioHabitacion.vigenteDesde.slice(0, 10)}</td>
                <td>
                  {precioHabitacion.vigenteHasta
                    ? precioHabitacion.vigenteHasta.slice(0, 10)
                    : '-'}
                </td>
                <td>
                    <span
                    className={
                    precioHabitacion.activo
                        ? 'badge badge-success'
                        : 'badge badge-muted'
                    }
                >
                    {precioHabitacion.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>       
                <td>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => eliminarPrecio(precioHabitacion.id)}
                    >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}