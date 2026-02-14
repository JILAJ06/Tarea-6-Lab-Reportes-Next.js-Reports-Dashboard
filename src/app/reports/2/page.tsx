import Link from 'next/link';
import { getActiveProjects } from '@/repositories/reportRepository';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function Report2Page(props: Props) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const data = await getActiveProjects(page);
  const hasNextPage = data.length === 5;

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
        <div className="flex justify-between items-end mb-8">
           <header>
             <h1 className="text-3xl font-bold text-slate-900">Proyectos Activos</h1>
             <p className="text-slate-500 mt-2">Monitoreo de recursos y horas consumidas.</p>
           </header>
           
           <div className="flex gap-2">
             <Link href={`/reports/2?page=${page - 1}`} className={`px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}>Anterior</Link>
             <Link href={`/reports/2?page=${page + 1}`} className={`px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 ${!hasNextPage ? 'pointer-events-none opacity-50' : ''}`}>Siguiente</Link>
           </div>
        </div>

        {/* --- GRID LAYOUT (MATCHING STYLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((row) => (
            <div key={row.project_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl">🚀</div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100 uppercase">En Curso</span>
              </div>
              
              <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">{row.project_name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-6">ID: {row.project_id}</p>

              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Presupuesto:</span>
                    <span className="font-bold text-slate-800">{formatMoney(row.budget)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Equipo:</span>
                    <span className="font-bold text-slate-800">{row.assigned_employees} personas</span>
                 </div>
                 <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Horas Totales</span>
                    <span className="text-lg font-bold text-indigo-600">{row.total_hours_worked}h</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}