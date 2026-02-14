// INTERFACES (Adaptadas a RRHH) ---

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

