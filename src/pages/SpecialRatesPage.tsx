import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';

import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Room } from '../types/room';
import type { SpecialRate } from '../types/specialRate';

const tiposHabitacion = ['Individual', 'Doble', 'Triple', 'Suite'];

export function SpecialRatesPage() {
  const [tarifas, setTarifas] = useState<SpecialRate[]>([]);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);

  const [modoTarifa, setModoTarifa] = useState<'TIPO' | 'HABITACION'>('TIPO');
  const [tipoHabitacion, setTipoHabitacion] = useState('');
  const [habitacionId, setHabitacionId] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
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
      const [tarifasResponse, habitacionesResponse] = await Promise.all([
        api.get<ApiResponse<SpecialRate[]>>('/special-rates'),
        api.get<ApiResponse<Room[]>>('/rooms'),
      ]);

      setTarifas(tarifasResponse.data.data);
      setHabitaciones(habitacionesResponse.data.data);
    } catch {
      setError('No se pudieron cargar las tarifas especiales.');
    } finally {
      setCargando(false);
    }
  }

  async function crearTarifa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (modoTarifa === 'TIPO' && !tipoHabitacion) {
      setError('El tipo de habitación es obligatorio.');
      return;
    }

    if (modoTarifa === 'HABITACION' && !habitacionId) {
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

    if (!vigenteHasta) {
      setError('La fecha vigente hasta es obligatoria.');
      return;
    }

    if (vigenteDesde >= vigenteHasta) {
      setError('La fecha desde debe ser anterior a la fecha hasta.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/special-rates', {
        nombre,
        descripcion: descripcion || undefined,
        tipoHabitacion: modoTarifa === 'TIPO' ? tipoHabitacion : undefined,
        habitacionId: modoTarifa === 'HABITACION' ? habitacionId : undefined,
        precio: Number(precio),
        vigenteDesde,
        vigenteHasta,
      });

      setNombre('');
      setDescripcion('');
      setTipoHabitacion('');
      setHabitacionId('');
      setPrecio('');
      setVigenteDesde('');
      setVigenteHasta('');

      await cargarDatos();
    } catch {
      setError('No se pudo crear la tarifa especial.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarTarifa(id: string) {
    const confirmar = confirm('¿Eliminar esta tarifa especial?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/special-rates/${id}`);

      await cargarDatos();
    } catch {
      setError('No se pudo eliminar la tarifa especial.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Tarifas especiales</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Tarifas especiales</h2>

      <CollapsibleForm title="Nueva tarifa especial">
        <form onSubmit={crearTarifa}>
          <h3>Nueva tarifa especial</h3>

        <div>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="descripcion">Descripción</label>
          <input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="modoTarifa">Aplicar tarifa a</label>
          <select
            id="modoTarifa"
            value={modoTarifa}
            onChange={(event) =>
              setModoTarifa(event.target.value as 'TIPO' | 'HABITACION')
            }
          >
            <option value="TIPO">Tipo de habitación</option>
            <option value="HABITACION">Habitación específica</option>
          </select>
        </div>

        {modoTarifa === 'TIPO' ? (
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
          <label htmlFor="vigenteHasta">Vigente hasta</label>
          <input
            id="vigenteHasta"
            type="date"
            value={vigenteHasta}
            onChange={(event) => setVigenteHasta(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear tarifa especial'}
        </button>
      </form>
    </CollapsibleForm>
      {error && <p>{error}</p>}

      <h3>Listado</h3>

      {tarifas.length === 0 ? (
        <p>No hay tarifas especiales cargadas.</p>
      ) : (
    <div className="table-wrapper">
        <table>
            <thead>
            <tr>
              <th>Nombre</th>
              <th>Aplicación</th>
              <th>Precio</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {tarifas.map((tarifa) => (
              <tr key={tarifa.id}>
                <td>{tarifa.nombre}</td>
                <td>
                  {tarifa.habitacion
                    ? `Habitación ${tarifa.habitacion.numero}`
                    : `Tipo ${tarifa.tipoHabitacion}`}
                </td>
                <td>${tarifa.precio}</td>
                <td>{tarifa.vigenteDesde.slice(0, 10)}</td>
                <td>{tarifa.vigenteHasta.slice(0, 10)}</td>
                <td>
                    <span
                    className={
                    tarifa.activo
                        ? 'badge badge-success'
                        : 'badge badge-muted'
                    }
                    >
                    {tarifa.activo ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                </td>    
                <td>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => eliminarTarifa(tarifa.id)}
                    >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
      )}
    </section>
  );
}