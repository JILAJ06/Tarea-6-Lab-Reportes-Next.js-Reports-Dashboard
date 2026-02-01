import pool from '@/lib/db';
import Link from 'next/link';

// 1. Interfaz para los datos de la vista 'employee_workload_vw'
interface WorkloadRow {
  employee_id: number;
  full_name: string;
  department: string;
  total_projects: string; // BIGINT viene como string
  total_hours_worked: string; // DECIMAL viene como string
  workload_status: string;
}

// 2. Función para obtener datos PAGINADOS
async function getData(page: number, limit: number) {
  // Calculamos el OFFSET (cuántos saltar)
  // Página 1: salta 0. Página 2: salta 5.
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM employee_workload_vw 
    ORDER BY total_hours_worked DESC 
    LIMIT $1 OFFSET $2
  `;
  
  // Pasamos los parámetros de forma segura ($1 y $2)
  const result = await pool.query(query, [limit, offset]);
  return result.rows as WorkloadRow[];
}

// 3. Función auxiliar para contar el total de filas (para saber si hay página siguiente)
async function getTotalCount() {
  const result = await pool.query('SELECT COUNT(*) FROM employee_workload_vw');
  return Number(result.rows[0].count);
}

// 4. Componente de Página
// En Next.js 15+, searchParams es una promesa que debemos esperar
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Report2Page(props: Props) {
  // Await searchParams para obtener los parámetros de la URL (?page=2)
  const searchParams = await props.searchParams;
  
  // Convertimos el parámetro 'page' a número. Si no existe, es la 1.
  const page = Number(searchParams.page) || 1;
  const LIMIT = 5; // Mostrar 5 empleados por página

  const data = await getData(page, LIMIT);
  const totalItems = await getTotalCount();
  const hasNextPage = (page * LIMIT) < totalItems;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Carga de Trabajo (Paginado)</h1>
            <p className="text-gray-600 mt-1">
              Empleados con asignaciones activas. 
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full border border-purple-200">
                Requisito: Paginación Server-Side
              </span>
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyectos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas Totales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.employee_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.total_projects}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.total_hours_worked} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Lógica visual según el estado que definimos en SQL */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${row.workload_status === 'Critical Overload' ? 'bg-red-100 text-red-800' : 
                        row.workload_status === 'High Load' ? 'bg-orange-100 text-orange-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {row.workload_status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay datos en esta página.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
          <Link
            href={`/reports/2?page=${page - 1}`}
            className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
              page <= 1 
                ? 'bg-gray-100 text-gray-400 pointer-events-none' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            &larr; Anterior
          </Link>
          
          <span className="text-sm text-gray-600">
            Página <span className="font-bold">{page}</span>
          </span>

          <Link
            href={`/reports/2?page=${page + 1}`}
            className={`px-4 py-2 border rounded text-sm font-medium transition-colors ${
              !hasNextPage 
                ? 'bg-gray-100 text-gray-400 pointer-events-none' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Siguiente &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}