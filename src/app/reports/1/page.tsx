import pool from '@/lib/db';
import Link from 'next/link';

interface DepartmentRow {
  department_id: number;
  department_name: string;
  department_budget: string; 
  total_employees: string;   
  total_salary_expense: string;
  avg_salary: string;
  salary_budget_ratio: string;
}

async function getData(): Promise<DepartmentRow[]> {
  const query = 'SELECT * FROM department_overview_vw ORDER BY department_id ASC';
  const result = await pool.query(query);
  return result.rows as DepartmentRow[];
}

export default async function Report1Page() {
  const data = await getData();
  const totalBudget = data.reduce((acc, row) => acc + Number(row.department_budget), 0);
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Resumen Financiero por Departamento</h1>
            <p className="text-gray-600 mt-1">
              Vista general de presupuestos, gastos salariales y personal.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
            <p className="text-sm text-gray-500 uppercase font-semibold">Presupuesto Global</p>
            <p className="text-2xl font-bold text-blue-600">{formatMoney(totalBudget)}</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto Salarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.department_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.department_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.total_employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatMoney(Number(row.department_budget))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatMoney(Number(row.total_salary_expense))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      Number(row.salary_budget_ratio) > 50 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {row.salary_budget_ratio}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}