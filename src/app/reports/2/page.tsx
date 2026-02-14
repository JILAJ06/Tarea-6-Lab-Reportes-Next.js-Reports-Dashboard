import Link from 'next/link';
import { getDepartmentMetrics } from '@/repositories/reportRepository';

export default async function Report1Page() {
  const data = await getDepartmentMetrics();

  const formatMoney = (amount: string | number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- NAV --- */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-900 font-medium">Inicio</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-900 font-bold">Métricas Departamentales</span>
        </div>
      </nav>

      {/* --- CONTENIDO --- */}
      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Reporte Financiero por Área</h1>
          <p className="text-slate-600 mt-2">Resumen de personal, costos de nómina y salud presupuestal.</p>
        </div>

        <div className="bg-white shadow-md rounded-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-serif tracking-wider uppercase">Departamento</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Personal Activo</th>
                <th className="px-6 py-4 text-right text-xs font-serif tracking-wider uppercase">Salario Promedio</th>
                <th className="px-6 py-4 text-right text-xs font-serif tracking-wider uppercase">Costo Nómina (Mensual)</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Uso de Presupuesto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((row: any, idx) => {
                const budgetPct = Number(row.budget_usage_pct || 0); 
                
                return (
                  <tr key={row.department_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    
                    {/* Columna 1: Nombre del Departamento */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{row.department_name}</div>
                      <div className="text-xs text-slate-500 font-mono">ID: {row.department_id}</div>
                    </td>

                    {/* Columna 2: Conteo de Empleados */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-700 font-mono">
                      <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-bold">
                        {row.employee_count}
                      </span>
                    </td>

                    {/* Columna 3: Salario Promedio */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-slate-600">
                      {formatMoney(row.average_salary)}
                    </td>

                    {/* Columna 4: Nómina Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm font-bold text-slate-800">
                      {/* Nota: Asegúrate que tu vista SQL devuelve 'total_monthly_payroll' o calcúlalo aquí */}
                      {formatMoney(row.total_monthly_payroll || (Number(row.average_salary) * Number(row.employee_count)))}
                    </td>

                    {/* Columna 5: Barra de Presupuesto (Visual) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full max-w-[120px] bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full ${budgetPct > 90 ? 'bg-red-600' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                            style={{ width: `${Math.min(budgetPct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${budgetPct > 100 ? 'text-red-600' : 'text-slate-500'}`}>
                           {budgetPct}% del anual
                        </span>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No se encontraron departamentos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}