CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_assignments_project ON project_assignments(project_id);

CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees(salary);

CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);