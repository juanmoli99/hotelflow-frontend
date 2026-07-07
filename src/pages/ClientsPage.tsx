import { useEffect, useState } from 'react';
import { CollapsibleForm } from '../components/CollapsibleForm';
import type { FormEvent } from 'react';
import { Alert } from '../components/Alert';
import { api } from '../api/api';

import type { ApiResponse } from '../types/auth';
import type { Client } from '../types/client';

export function ClientsPage() {
  const [clientes, setClientes] = useState<Client[]>([]);

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [clienteEditandoId, setClienteEditandoId] =
    useState<string | null>(null);
  const [nombreCompletoEditando, setNombreCompletoEditando] =
    useState('');
  const [documentoEditando, setDocumentoEditando] = useState('');
  const [telefonoEditando, setTelefonoEditando] = useState('');
  const [emailEditando, setEmailEditando] = useState('');
  const [direccionEditando, setDireccionEditando] = useState('');
  const [observacionesEditando, setObservacionesEditando] =
    useState('');

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerClientes();
  }, []);

  async function obtenerClientes() {
    try {
      const response = await api.get<ApiResponse<Client[]>>('/clients');

      setClientes(response.data.data);
    } catch {
      setError('No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  }

  async function crearCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (!nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!documento.trim()) {
      setError('El documento es obligatorio.');
      return;
    }

    setGuardando(true);

    try {
      await api.post('/clients', {
        nombreCompleto,
        documento,
        telefono: telefono || undefined,
        email: email || undefined,
        direccion: direccion || undefined,
        observaciones: observaciones || undefined,
      });

      setNombreCompleto('');
      setDocumento('');
      setTelefono('');
      setEmail('');
      setDireccion('');
      setObservaciones('');

      await obtenerClientes();
    } catch {
      setError('No se pudo crear el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  function iniciarEdicion(cliente: Client) {
    setClienteEditandoId(cliente.id);
    setNombreCompletoEditando(cliente.nombreCompleto);
    setDocumentoEditando(cliente.documento);
    setTelefonoEditando(cliente.telefono ?? '');
    setEmailEditando(cliente.email ?? '');
    setDireccionEditando(cliente.direccion ?? '');
    setObservacionesEditando(cliente.observaciones ?? '');
    setError('');
  }

  function cancelarEdicion() {
    setClienteEditandoId(null);
    setNombreCompletoEditando('');
    setDocumentoEditando('');
    setTelefonoEditando('');
    setEmailEditando('');
    setDireccionEditando('');
    setObservacionesEditando('');
  }

  async function guardarEdicion(id: string) {
    setError('');

    if (!nombreCompletoEditando.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!documentoEditando.trim()) {
      setError('El documento es obligatorio.');
      return;
    }

    try {
      await api.put(`/clients/${id}`, {
        nombreCompleto: nombreCompletoEditando,
        documento: documentoEditando,
        telefono: telefonoEditando || undefined,
        email: emailEditando || undefined,
        direccion: direccionEditando || undefined,
        observaciones: observacionesEditando || undefined,
      });

      cancelarEdicion();

      await obtenerClientes();
    } catch {
      setError('No se pudo actualizar el cliente.');
    }
  }

  async function eliminarCliente(id: string) {
    const confirmar = confirm('¿Eliminar este cliente?');

    if (!confirmar) {
      return;
    }

    setError('');

    try {
      await api.delete(`/clients/${id}`);

      await obtenerClientes();
    } catch {
      setError('No se pudo eliminar el cliente.');
    }
  }

  if (cargando) {
    return (
      <section>
        <h2>Clientes</h2>
        <p>Cargando...</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Clientes</h2>

      <CollapsibleForm title="Nuevo cliente">
        <form onSubmit={crearCliente}>
          <h3>Nuevo cliente</h3>

        <div>
          <label htmlFor="nombreCompleto">Nombre completo</label>
          <input
            id="nombreCompleto"
            type="text"
            value={nombreCompleto}
            onChange={(event) => setNombreCompleto(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="documento">Documento</label>
          <input
            id="documento"
            type="text"
            value={documento}
            onChange={(event) => setDocumento(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="observaciones">Observaciones</label>
          <input
            id="observaciones"
            type="text"
            value={observaciones}
            onChange={(event) => setObservaciones(event.target.value)}
          />
        </div>

        <button type="submit" className="button-success" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Crear cliente'}
        </button>
      </form>
    </CollapsibleForm>

      {error && <Alert type="error">{error}</Alert>}
      
      <h3>Listado</h3>

      {clientes.length === 0 ? (
        <p>No hay clientes cargados.</p>
      ) : (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  {clienteEditandoId === cliente.id ? (
                    <input
                      type="text"
                      value={nombreCompletoEditando}
                      onChange={(event) =>
                        setNombreCompletoEditando(event.target.value)
                      }
                    />
                  ) : (
                    cliente.nombreCompleto
                  )}
                </td>

                <td>
                  {clienteEditandoId === cliente.id ? (
                    <input
                      type="text"
                      value={documentoEditando}
                      onChange={(event) =>
                        setDocumentoEditando(event.target.value)
                      }
                    />
                  ) : (
                    cliente.documento
                  )}
                </td>

                <td>
                  {clienteEditandoId === cliente.id ? (
                    <input
                      type="text"
                      value={telefonoEditando}
                      onChange={(event) =>
                        setTelefonoEditando(event.target.value)
                      }
                    />
                  ) : (
                    cliente.telefono ?? '-'
                  )}
                </td>

                <td>
                  {clienteEditandoId === cliente.id ? (
                    <input
                      type="email"
                      value={emailEditando}
                      onChange={(event) =>
                        setEmailEditando(event.target.value)
                      }
                    />
                  ) : (
                    cliente.email ?? '-'
                  )}
                </td>

                <td>
                  {clienteEditandoId === cliente.id ? (
                    <>
                      <button
                        type="button"
                        className="button-success"
                        onClick={() => guardarEdicion(cliente.id)}
                      >
                        Guardar
                      </button>

                      <button
                        type="button"
                        className="button-warning"
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(cliente)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="button-danger"
                        onClick={() => eliminarCliente(cliente.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
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