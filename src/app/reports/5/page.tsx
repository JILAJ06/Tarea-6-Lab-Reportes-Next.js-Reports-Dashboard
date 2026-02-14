import Link from 'next/link';
import { z } from 'zod';
import { getProductivityRank } from '@/repositories/reportRepository';

const filterSchema = z.object({ project: z.string().optional() });

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function Report5Page(props: Props) {
  const searchParams = await props.searchParams;
  const { project } = filterSchema.parse({ project: searchParams.project });
  const data = await getProductivityRank(project);

  const projects = ['Plataforma E-commerce', 'Dashboard Financiero', 'IA para Predicción de Ventas'];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Top Performers</h1>
          <p className="text-slate-500 mt-2 mb-6">Ranking de productividad por proyecto.</p>
          
          <div className="flex flex-wrap gap-2">
             <Link href="/reports/5" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!project ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Global</Link>
             {projects.map((p) => (
                <Link key={p} href={`/reports/5?project=${encodeURIComponent(p)}`} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${project === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                   {p}
                </Link>
             ))}
          </div>
        </div>

        {/* --- TABLE CONTAINER (MATCHING VIEW 1 & 3) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4 text-center w-20">Rank</th>
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4 text-right">Horas Registradas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={`${row.employee_id}-${row.project_name}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full font-bold text-sm ${
                        row.productivity_rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        row.productivity_rank === 2 ? 'bg-slate-200 text-slate-700' :
                        row.productivity_rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'text-slate-400 bg-slate-50'
                    }`}>
                       {row.productivity_rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-900">{(row as any).employee_name || row.full_name}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-block px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs border border-slate-200 font-medium">
                        {row.project_name}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <span className="font-mono text-lg font-bold text-indigo-600">{Number(row.hours_worked)}</span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Selecciona un proyecto para ver el ranking.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}