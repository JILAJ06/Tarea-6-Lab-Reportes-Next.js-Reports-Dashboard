import pool from '@/lib/db';
import Link from 'next/link';

interface FinancialRow {
  project_id: number;
  project_name: string;
  allocated_budget: string;
  estimated_labor_cost: string;
  budget_remaining: string;
  percent_budget_used: string;
}

async function getData(page: number, limit: number) {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM project_financial_cte_vw 
    ORDER BY CAST(percent_budget_used AS DECIMAL) DESC 
    LIMIT $1 OFFSET $2
  `;
  
  const result = await pool.query(query, [limit, offset]);
  return result.rows as FinancialRow[];
}

async function getTotalCount() {
  const result = await pool.query('SELECT COUNT(*) FROM project_financial_cte_vw');
  return Number(result.rows[0].count);
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Report5Page(props: Props) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const LIMIT = 5;
  const data = await getData(page, LIMIT);
  const totalItems = await getTotalCount();
  const hasNextPage = (page * LIMIT) < totalItems;
  const formatMoney = (amount: string) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Análisis Financiero (CTE)</h1>
            <p className="text-gray-600 mt-1">
              Costo real de mano de obra vs Presupuesto.
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full border border-purple-200">
                Paginación + CTE
              </span>
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Laboral (Est.)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Usado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => {
                const percent = Number(row.percent_budget_used);
                const isOverBudget = percent > 100;
                
                return (
                  <tr key={row.project_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(row.allocated_budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(row.estimated_labor_cost)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      Number(row.budget_remaining) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatMoney(row.budget_remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-xs font-semibold mr-2 ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                          {percent}%
                        </span>
                        {/* Barra de progreso visual */}
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isOverBudget ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
          <Link
            href={`/reports/5?page=${page - 1}`}
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
            href={`/reports/5?page=${page + 1}`}
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