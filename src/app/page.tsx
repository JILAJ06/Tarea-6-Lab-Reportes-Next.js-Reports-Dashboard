import Link from 'next/link';

export default function Home() {
  const reports = [
    { 
      id: 1, 
      category: "Finanzas",
      title: "Métricas Departamentales", 
      desc: "Resumen de capital humano, nómina mensual y distribución de presupuesto por área.", 
      icon: "📊",
      color: "bg-indigo-50 text-indigo-600" 
    },
    { 
      id: 2, 
      category: "Operaciones",
      title: "Gestión de Proyectos", 
      desc: "Monitoreo en tiempo real de proyectos activos, asignación de personal y consumo de horas.", 
      icon: "🚀",
      color: "bg-emerald-50 text-emerald-600" 
    },
    { 
      id: 3, 
      category: "Recursos Humanos",
      title: "Análisis Salarial", 
      desc: "Identificación de talento con compensación superior al promedio (High Earners).", 
      icon: "💎",
      color: "bg-amber-50 text-amber-600" 
    },
    { 
      id: 4, 
      category: "Contabilidad",
      title: "Control Presupuestal", 
      desc: "Semáforo de salud financiera, disponibilidad de fondos y alertas de déficit.", 
      icon: "📉",
      color: "bg-rose-50 text-rose-600" 
    },
    { 
      id: 5, 
      category: "Productividad",
      title: "Top Performers", 
      desc: "Ranking de desempeño y dedicación de horas por proyecto estratégico.", 
      icon: "🏆",
      color: "bg-purple-50 text-purple-600" 
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-100">
            Enterprise Resource Planning
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Corporativo</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Plataforma centralizada para la toma de decisiones basada en datos. 
            Gestión integral de RRHH, Finanzas y Proyectos.
          </p>
        </div>
      </div>

      {/* --- GRID DE REPORTES --- */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <Link 
              key={report.id} 
              href={`/reports/${report.id}`}
              className="group block h-full"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 relative overflow-hidden">
                
                {/* Decoración de fondo suave */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 group-hover:bg-indigo-50/50"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${report.color}`}>
                      {report.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      Reporte 0{report.id}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1 block">
                      {report.category}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {report.title}
                    </h2>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {report.desc}
                  </p>

                  <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Ver Detalles <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* TARJETA "PRÓXIMAMENTE" (Relleno visual) */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 h-full flex flex-col justify-center items-center text-center opacity-70">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 text-xl">
              ✨
            </div>
            <h3 className="font-bold text-slate-600">Nuevos Módulos</h3>
            <p className="text-sm text-slate-400 mt-2">Próximamente integración con IA predictiva.</p>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Desarrollado para la asignatura de <span className="font-semibold text-slate-600">Base de Datos Avanzadas</span>
          </p>
          <div className="flex justify-center gap-4 text-xs font-mono text-slate-300 mt-4">
            <span>NEXT.JS 15</span>
            <span>•</span>
            <span>POSTGRESQL 18</span>
            <span>•</span>
            <span>DOCKER</span>
            <span>•</span>
            <span>TAILWIND CSS</span>
          </div>
        </div>
      </footer>
    </main>
  );
}