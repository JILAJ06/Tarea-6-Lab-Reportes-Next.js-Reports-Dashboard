import Link from 'next/link';
import { z } from 'zod';
import { getCoursePerformance } from '@/services/reportService';

const filterSchema = z.object({
  term: z.string().optional().default('2025-A'),
});


type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Report1Page(props: Props) {
  const searchParams = await props.searchParams;
  const { term } = filterSchema.parse({ term: searchParams.term });
  const data = await getCoursePerformance(term);
  const availableTerms = ['2024-B', '2025-A', '2025-B'];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-900 font-medium">Inicio</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-900 font-bold">Rendimiento Académico</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Reporte de Rendimiento</h1>
            <p className="text-slate-600 mt-2">Análisis estadístico de aprobación por asignatura.</p>
          </div>
          <div className="bg-white p-1 rounded-md border border-slate-300 shadow-sm flex">
            {availableTerms.map((t) => (
              <Link
                key={t}
                href={`/reports/1?term=${t}`}
                className={`px-4 py-2 text-sm font-serif font-medium transition-colors rounded-sm ${
                  term === t ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-serif tracking-wider uppercase">Asignatura</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Inscritos</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Promedio</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Reprobación</th>
                <th className="px-6 py-4 text-center text-xs font-serif tracking-wider uppercase">Índice de Riesgo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((row, idx) => {
                const failureRate = Number(row.failure_rate);
                return (
                  <tr key={row.course_code} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{row.course_name}</div>
                      <div className="text-xs text-slate-500 font-mono">CLAVE: {row.course_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-700 font-mono">
                      {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="font-mono text-sm font-bold text-slate-800">
                        {Number(row.average_grade).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600 font-mono">
                      {row.failed_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden mr-2">
                          <div 
                            className={`h-full ${failureRate > 30 ? 'bg-red-700' : 'bg-emerald-600'}`} 
                            style={{ width: `${Math.min(failureRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{failureRate.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No hay registros para el periodo {term}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}