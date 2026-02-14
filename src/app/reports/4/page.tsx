import Link from 'next/link';
import { getBudgetHealth } from '@/repositories/reportRepository';

export default async function Report4Page() {
  const data = await getBudgetHealth();
  const formatMoney = (val: string | number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(val));

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
          <h1 className="text-3xl font-bold text-slate-900">Control Presupuestal</h1>
          <p className="text-slate-500 mt-2">Disponibilidad de fondos por departamento.</p>
        </header>

        {/* --- GRID LAYOUT (MATCHING VIEW 2) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((row) => {
            const total = Number(row.total_budget);
            const remaining = Number(row.remaining_budget);
            const percent = Math.min(((total - remaining) / total) * 100, 100);
            const isCritical = row.budget_status.includes('Deficit') || row.budget_status.includes('Critical');
            const colorClass = isCritical ? 'bg-rose-500' : 'bg-emerald-500';

            return (
              <div key={row.department_name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden">
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass}`}></div>
                 
                 <div className="flex justify-between items-start mb-6 pl-2">
                    <div>
                       <h3 className="font-bold text-lg text-slate-900">{row.department_name}</h3>
                       <p className="text-sm text-slate-500">Total: {formatMoney(total)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isCritical ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                       {row.budget_status}
                    </span>
                 </div>

                 <div className="pl-2">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-3xl font-bold text-slate-800">{formatMoney(remaining)}</span>
                       <span className="text-xs font-bold text-slate-400 uppercase">Disponible</span>
                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                       <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                       <span>{percent.toFixed(1)}% Gastado</span>
                       {remaining < 0 && <span className="text-rose-600 font-bold">Sobregiro</span>}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}