import pool from '@/lib/db';

// --- INTERFACES (Adaptadas a RRHH) ---

export interface DeptMetric {
  department_id: number;
  department_name: string;
  employee_count: string; // Postgres devuelve count como string
  average_salary: string;
}

export interface ProjectStat {
  project_id: number;
  project_name: string;
  budget: string;
  assigned_employees: string;
  total_hours_worked: string;
}

export interface SalaryAnalysis {
  employee_id: number;
  first_name: string;
  last_name: string;
  position: string;
  salary: string;
  salary_status: string;
}

export interface BudgetHealth {
  department_name: string;
  total_budget: string;
  remaining_budget: string;
  budget_status: string;
}

export interface ProductivityRank {
  employee_id: number;
  full_name: string;
  project_name: string;
  hours_worked: string;
  productivity_rank: number;
}

// --- FUNCIONES (Queries a las nuevas Vistas) ---

// Reporte 1: Métricas Generales
export async function getDepartmentMetrics(): Promise<DeptMetric[]> {
  const query = 'SELECT * FROM vw_department_metrics ORDER BY average_salary DESC';
  const result = await pool.query(query);
  return result.rows as DeptMetric[];
}

// Reporte 2: Proyectos Activos (Paginado)
export async function getActiveProjects(page: number = 1): Promise<ProjectStat[]> {
  const limit = 5;
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM vw_active_projects 
    ORDER BY total_hours_worked DESC 
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows as ProjectStat[];
}

// Reporte 3: Altos Salarios (Búsqueda + Paginación)
export async function getHighSalaries(search: string, page: number = 1): Promise<SalaryAnalysis[]> {
  const limit = 5;
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM vw_high_salary_analysis 
    WHERE first_name ILIKE $1 OR last_name ILIKE $1
    ORDER BY salary DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [`%${search}%`, limit, offset]);
  return result.rows as SalaryAnalysis[];
}

// Reporte 4: Salud Financiera
export async function getBudgetHealth(): Promise<BudgetHealth[]> {
  const query = 'SELECT * FROM vw_budget_health ORDER BY remaining_budget ASC';
  const result = await pool.query(query);
  return result.rows as BudgetHealth[];
}

// Reporte 5: Ranking Productividad
export async function getProductivityRank(projectName?: string): Promise<ProductivityRank[]> {
  let query = 'SELECT * FROM vw_employee_productivity_rank';
  const params: string[] = [];

  if (projectName) {
    query += ' WHERE project_name ILIKE $1';
    params.push(`%${projectName}%`);
  }
  
  query += ' ORDER BY project_name, productivity_rank ASC';
  
  const result = await pool.query(query, params);
  return result.rows as ProductivityRank[];
}
