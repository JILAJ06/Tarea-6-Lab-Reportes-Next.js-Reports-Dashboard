import Link from 'next/link';
import { getHighSalaries } from '@/repositories/reportRepository';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function Report3Page(props: Props) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = Number(searchParams.page) || 1;
  const data = await getHighSalaries(query, page);

  const formatMoney = (val: string) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(val));

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
           <header>
             <h1 className="text-3xl font-bold text-slate-900">Análisis Salarial</h1>
             <p className="text-slate-500 mt-2">Empleados con compensación superior al promedio.</p>
           </header>
           
           <form className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                name="q" 
                defaultValue={query} 
                placeholder="Buscar empleado..." 
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-full md:w-64"
              />
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Buscar</button>
           </form>
        </div>

        {/* --- TABLE CONTAINER (MATCHING VIEW 1) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Departamento</th>
                <th className="px-6 py-4 text-right">Salario</th>
                <th className="px-6 py-4 text-center">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.employee_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{row.first_name} {row.last_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.position}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{(row as any).department_name}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-800">
                    {formatMoney(row.salary)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                       row.salary_status === 'High Earner' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                       {row.salary_status === 'High Earner' ? 'Elite' : 'Superior'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No se encontraron resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center gap-2">
           <Link href={`/reports/3?q=${query}&page=${page - 1}`} className={`px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}>Anterior</Link>
           <Link href={`/reports/3?q=${query}&page=${page + 1}`} className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Siguiente</Link>
        </div>
      </main>
    </div>
  );
}