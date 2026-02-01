import pool from '@/lib/db';
import Link from 'next/link';
import { z } from 'zod';

const searchSchema = z.object({
  status: z.enum(['active', 'completed', 'on_hold']).optional().catch('active'), 
});

interface ProjectRow {
  project_id: number;
  project_name: string;
  status: string;
  budget: string;
  assigned_staff: string;
  total_hours_invested: string;
  timeline_status: string;
}

async function getData(statusFilter: string) {
  const query = `
    SELECT * FROM project_status_performance_vw 
    WHERE status = $1
    ORDER BY budget DESC
  `;
  
  const result = await pool.query(query, [statusFilter]);
  return result.rows as ProjectRow[];
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Report3Page(props: Props) {
  const searchParams = await props.searchParams;
  const parsedParams = searchSchema.parse({
    status: searchParams.status
  });
  
  const currentFilter = parsedParams.status || 'active';
  const data = await getData(currentFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Estado y Eficiencia de Proyectos</h1>
            <p className="text-gray-600 mt-1">
              Monitoreo de tiempos y entregas.
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">
                Requisito: Filtro con Zod
              </span>
            </p>
          </div>

          {/* UI DEL FILTRO: Botones simples que recargan la página */}
          <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
            {['active', 'completed', 'on_hold'].map((status) => (
              <Link
                key={status}
                href={`/reports/3?status=${status}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  currentFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.replace('_', ' ')}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado SQL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Análisis de Tiempo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.project_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{row.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(row.budget))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.assigned_staff} personas
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Visualizamos el resultado del CASE complejo de SQL */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                      row.timeline_status.includes('Late') || row.timeline_status.includes('Overdue')
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {row.timeline_status}
                    </span>
                  </td>
                </tr>
              ))}
               {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay proyectos con el estado "{currentFilter}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}