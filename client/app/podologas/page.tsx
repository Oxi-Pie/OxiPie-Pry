'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Podologa } from '@/types';

export default function PodologasPage() {
  const [podologas, setPodologas] = useState<Podologa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPodologas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_SCHEDULING}/podologas`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPodologas(data);
      }
    } catch (error) {
      console.error("Error cargando podólogas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodologas();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar especialista?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_SCHEDULING}/podologas/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setPodologas(podologas.filter(p => p.id_pod !== id));
      } else {
        alert('No se puede eliminar (posiblemente tenga citas asociadas)');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div className="text-center mt-10 text-oxi-blue font-bold">Cargando equipo...</div>;

  return (
    <div className="px-4 sm:px-0 mt-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-oxi-dark">Equipo de Podólogas</h1>
          <p className="mt-2 text-sm text-gray-700">Gestión del personal médico del centro.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/podologas/nuevo"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-pie-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pie-dark"
          >
            + Nueva Podóloga
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
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6">Nombre</th>
                    <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Cédula</th>
                    <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-900">Teléfono</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-bold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {podologas.map((pod) => (
                    <tr key={pod.id_pod} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-oxi-dark sm:pl-6">
                        {pod.nombres_pod} {pod.apellidos_pod}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{pod.cedula_pod}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{pod.telefono_pod}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <Link href={`/podologas/${pod.id_pod}`} className="text-oxi-blue hover:text-oxi-dark font-semibold">Editar</Link>
                        <button onClick={() => handleDelete(pod.id_pod)} className="text-red-500 hover:text-red-700 font-semibold">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}