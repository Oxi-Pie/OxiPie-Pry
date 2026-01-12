'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Paciente } from '@/types';
import { useRouter } from 'next/navigation';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATIENTS}/pacientes`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPacientes(data);
      }
    } catch (error) {
      console.error("Error cargando pacientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATIENTS}/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 204) {
        // Actualizamos el estado local filtrando el eliminado para no recargar página
        setPacientes(pacientes.filter(p => p.id_pac !== id));
        alert('Paciente eliminado.');
      } else {
        alert('Error al eliminar paciente.');
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
  };

  if (loading) return <div className="text-center mt-10 text-oxi-blue font-bold">Cargando pacientes...</div>;

  return (
    <div className="px-4 sm:px-0 mt-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-oxi-dark">Pacientes</h1>
          <p className="mt-2 text-sm text-gray-700">Gestión completa de historias clínicas.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/pacientes/nuevo"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-pie-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pie-dark focus:outline-none sm:w-auto"
          >
            + Nuevo Paciente
          </Link>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6">Nombre Completo</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Cédula</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Teléfono</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Género</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-bold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pacientes.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">No hay pacientes registrados aún.</td>
                     </tr>
                  ) : (
                    pacientes.map((paciente) => (
                      <tr key={paciente.id_pac} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-oxi-dark sm:pl-6">
                          {paciente.nombres_pac} {paciente.apellidos_pac}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{paciente.cedula_pac}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{paciente.telefono_pac || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 capitalize">{paciente.genero_pac}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                          <Link href={`/pacientes/${paciente.id_pac}`} className="text-oxi-blue hover:text-oxi-dark font-semibold">
                            Editar
                          </Link>
                          <button 
                            onClick={() => handleDelete(paciente.id_pac)}
                            className="text-red-500 hover:text-red-700 font-semibold"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}