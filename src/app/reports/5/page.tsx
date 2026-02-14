import Link from 'next/link';
import { z } from 'zod';
import { getRankStudents } from '@/services/reportService';

const filterSchema = z.object({ program: z.string().optional() });


type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function Report5Page(props: Props) {
  const searchParams = await props.searchParams;
  const { program } = filterSchema.parse({ program: searchParams.program });
  const data = await getRankStudents(program);
  const programs = ['Ing. Software', 'Arquitectura', 'Derecho'];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-900 font-medium">Inicio</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-amber-700 font-bold">Cuadro de Honor</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Excelencia Académica</h1>
          <p className="text-slate-600">Ranking oficial de estudiantes destacados por programa educativo.</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <Link href="/reports/5" className={`px-4 py-1 text-sm font-medium border ${!program ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>Todos</Link>
          {programs.map((p) => (
            <Link key={p} href={`/reports/5?program=${encodeURIComponent(p)}`} className={`px-4 py-1 text-sm font-medium border ${program === p ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{p}</Link>
          ))}
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 w-16 text-center">
                    <span className={`inline-block w-8 h-8 leading-8 rounded-full font-serif font-bold text-sm ${
                      row.rank_position === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      row.rank_position === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                      row.rank_position === 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                      'text-slate-400'
                    }`}>
                      {row.rank_position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-lg">{row.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{row.program}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-2xl font-serif font-bold text-slate-800">{Number(row.final_average).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Promedio Final</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}