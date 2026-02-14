import Link from 'next/link';
import { getDepartmentMetrics } from '@/repositories/reportRepository';

export default async function Report1Page() {
  const data = await getDepartmentMetrics();

  const formatMoney = (amount: string | number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(amount));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- UNIFIED NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">DH</div>
            <span className="font-bold text-lg tracking-tight">Dashboard<span className="text-indigo-600">Corporativo</span></span>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">← Volver al Inicio</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Métricas Departamentales</h1>
          <p className="text-slate-500 mt-2">Resumen financiero y distribución de personal por área.</p>
        </header>

        {/* --- DATA CONTAINER --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4 text-center">Personal</th>
                <th className="px-6 py-4 text-right">Salario Promedio</th>
                <th className="px-6 py-4 text-right">Nómina Mensual</th>
                <th className="px-6 py-4 text-center">Uso de Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any) => {
                const budgetPct = Number(row.budget_usage_pct || 0);
                const barColor = budgetPct > 90 ? 'bg-rose-500' : budgetPct > 75 ? 'bg-amber-400' : 'bg-emerald-500';
                
                return (
                  <tr key={row.department_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{row.department_name}</div>
                      <div className="text-xs text-slate-400 font-mono">ID: {row.department_id}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                        {row.employee_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">
                      {formatMoney(row.average_salary)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-800">
                      {formatMoney(row.total_monthly_payroll || (Number(row.average_salary) * Number(row.employee_count)))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${Math.min(budgetPct, 100)}%` }}></div>
                         </div>
                         <span className="text-xs font-bold text-slate-500 w-12 text-right">{budgetPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}