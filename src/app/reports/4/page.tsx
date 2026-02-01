import pool from '@/lib/db';
import Link from 'next/link';
import { z } from 'zod';

const searchSchema = z.object({
  dept: z.string().optional(),
});

interface SalaryRankRow {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  salary: string;
  salary_rank_in_dept: string;
  diff_from_dept_avg: string;
}

async function getData(departmentFilter?: string) {
  let query = 'SELECT * FROM salary_ranking_vw';
  const params: string[] = [];

  if (departmentFilter) {
    query += ' WHERE department = $1';
    params.push(departmentFilter);
  }

  query += ' ORDER BY department, salary_rank_in_dept ASC';

  const result = await pool.query(query, params);
  return result.rows as SalaryRankRow[];
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Report4Page(props: Props) {
  const searchParams = await props.searchParams;
  const parsed = searchSchema.parse({
    dept: searchParams.dept
  });

  const data = await getData(parsed.dept);

  const departments = [
    'Ingeniería de Software', 
    'Recursos Humanos', 
    'Marketing', 
    'Finanzas', 
    'Investigación y Desarrollo'
  ];

  const formatMoney = (amount: string) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ranking de Salarios</h1>
            <p className="text-gray-600 mt-1">
              Clasificación interna usando Window Functions.
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">
                Filtro + Window Func
              </span>
            </p>
          </div>
        </div>

        {/* UI de Filtros: Botones por departamento */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link 
            href="/reports/4"
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              !parsed.dept ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todos
          </Link>
          {departments.map(dept => (
            <Link 
              key={dept}
              href={`/reports/4?dept=${encodeURIComponent(dept)}`}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                parsed.dept === dept ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {dept}
            </Link>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ranking (Depto)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comparativa Promedio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => {
                const diff = Number(row.diff_from_dept_avg);
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          row.salary_rank_in_dept === '1' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                          row.salary_rank_in_dept === '2' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                          row.salary_rank_in_dept === '3' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'text-gray-500'
                        }`}>
                          {row.salary_rank_in_dept}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.first_name} {row.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(row.salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff > 0 ? '+' : ''}{formatMoney(row.diff_from_dept_avg)}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">vs avg</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}