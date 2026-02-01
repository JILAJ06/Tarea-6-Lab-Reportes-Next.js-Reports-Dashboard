CREATE INDEX IF NOT EXISTS idx_emp_dept_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_proj_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_pa_emp_proj ON project_assignments(project_id, employee_id);