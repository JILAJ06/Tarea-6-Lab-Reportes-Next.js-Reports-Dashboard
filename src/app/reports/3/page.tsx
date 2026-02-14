import Link from 'next/link';
import { getStudentsAtRiskPage } from '@/services/reportService';


type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function Report3Page(props: Props) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  
  const page = Number(searchParams.page) || 1;
  const LIMIT = 5; 
  
  const { rows: data, total: totalItems } = await getStudentsAtRiskPage(query, page, LIMIT);
  const hasNextPage = (page * LIMIT) < totalItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-900 font-medium">Inicio</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-red-800 font-bold">Riesgo Académico</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="bg-white p-8 rounded-sm shadow-sm border-l-4 border-red-700 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">Detección de Riesgo</h1>
              <p className="text-slate-600">Alumnos con promedio &lt; 6.0 o inasistencia alta.</p>
            </div>
            
            <form className="flex w-full md:w-auto gap-2">
              <input type="text" name="q" defaultValue={query} placeholder="Buscar alumno..." className="px-4 py-2 border border-slate-300 text-sm w-full md:w-64 focus:outline-none focus:border-blue-900" />
              <input type="hidden" name="page" value="1" />
              <button type="submit" className="bg-slate-800 text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-slate-900">Buscar</button>
            </form>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 mb-6">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-serif font-bold text-slate-600 uppercase">Alumno</th>
                <th className="px-6 py-3 text-left text-xs font-serif font-bold text-slate-600 uppercase">Programa</th>
                <th className="px-6 py-3 text-center text-xs font-serif font-bold text-slate-600 uppercase">Promedio</th>
                <th className="px-6 py-3 text-center text-xs font-serif font-bold text-slate-600 uppercase">Faltas</th>
                <th className="px-6 py-3 text-center text-xs font-serif font-bold text-slate-600 uppercase">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.map((row) => (
                <tr key={row.student_id}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.program}</td>
                  <td className={`px-6 py-4 text-center font-mono font-bold ${Number(row.current_average) < 6 ? 'text-red-700' : 'text-slate-700'}`}>
                    {Number(row.current_average).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{row.total_absences}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-xs font-bold uppercase border rounded-full ${
                      row.risk_status.includes('CRITICAL') ? 'bg-red-50 text-red-800 border-red-200' :
                      row.risk_status.includes('Academic') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-orange-50 text-orange-800 border-orange-200'
                    }`}>
                      {row.risk_status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron resultados.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
                Página {page} {query && `(Filtrando por: "${query}")`}
            </div>
            <div className="flex gap-2">
                <Link 
                    href={`/reports/3?q=${query}&page=${page - 1}`} 
                    className={`px-4 py-2 border border-slate-300 bg-white text-slate-700 font-medium text-xs rounded-sm hover:bg-slate-50 ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    &larr; Anterior
                </Link>
                <Link 
                    href={`/reports/3?q=${query}&page=${page + 1}`} 
                    className={`px-4 py-2 border border-slate-300 bg-white text-slate-700 font-medium text-xs rounded-sm hover:bg-slate-50 ${!hasNextPage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    Siguiente &rarr;
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
}