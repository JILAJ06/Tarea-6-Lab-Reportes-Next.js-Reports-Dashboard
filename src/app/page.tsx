import Link from 'next/link';

export default function Home() {
  const reports = [
    { id: 1, title: "Resumen General", desc: "Presupuestos y salarios por departamento", color: "bg-blue-500" },
    { id: 2, title: "Carga de Trabajo", desc: "Empleados con múltiples proyectos", color: "bg-green-500" },
    { id: 3, title: "Estado de Proyectos", desc: "Análisis de tiempos y entregas", color: "bg-purple-500" },
    { id: 4, title: "Ranking Salarial", desc: "Comparativa de sueldos por área", color: "bg-orange-500" },
    { id: 5, title: "Finanzas Reales", desc: "Costos reales vs Presupuesto (CTE)", color: "bg-red-500" },
  ];

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard de Reportes 📊</h1>
        <p className="text-gray-600 mb-8">Sistema de gestión y análisis de proyectos (Lab Tarea 6)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Link 
              key={report.id} 
              href={`/reports/${report.id}`}
              className="block group"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 h-full">
                <div className={`${report.color} h-2 w-full`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      Reporte {report.id}
                    </h2>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">
                      SQL View
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{report.title}</h3>
                  <p className="text-gray-500 text-sm">
                    {report.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          Proyecto realizado con Next.js, PostgreSQL y Docker.
        </footer>
      </div>
    </main>
  );
}
