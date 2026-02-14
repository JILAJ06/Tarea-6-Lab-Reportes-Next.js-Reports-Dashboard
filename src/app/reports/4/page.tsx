import Link from 'next/link';
import { getAttendanceByGroup } from '@/services/reportService';


export default async function Report4Page() {
  const data = await getAttendanceByGroup();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-900 font-medium">Inicio</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-900 font-bold">Monitoreo de Asistencia</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Cumplimiento de Asistencia</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {data.map((row) => {
            const percent = Number(row.attendance_percentage);
            return (
              <div key={row.group_id} className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-800">{row.course_name}</h3>
                  <span className={`text-lg font-mono font-bold ${percent < 80 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full ${percent < 80 ? 'bg-red-600' : percent < 90 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wide">
                  <span>Docente: {row.teacher_name}</span>
                  <span>Registros: {row.total_classes_recorded}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}