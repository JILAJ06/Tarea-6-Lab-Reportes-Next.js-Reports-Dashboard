-- db/03_reports_vw.sql (CORREGIDO)

-- VISTA 1: Métricas por Departamento
CREATE OR REPLACE VIEW vw_department_metrics AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(e.id) AS employee_count,
    COALESCE(SUM(e.salary), 0) AS total_monthly_payroll,
    ROUND(AVG(e.salary), 2) AS average_salary,
    CASE 
        WHEN d.budget > 0 THEN ROUND((SUM(e.salary) * 12 / d.budget) * 100, 1)
        ELSE 0 
    END AS budget_usage_pct
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
GROUP BY d.id, d.name, d.budget;

-- VISTA 2: Proyectos Activos (NOMBRE CORREGIDO: vw_active_projects)
CREATE OR REPLACE VIEW vw_active_projects AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.budget, -- Esta columna faltaba y el front la pide
    COUNT(DISTINCT pa.employee_id) AS assigned_employees, -- Renombrado para coincidir con TS
    COALESCE(SUM(pa.hours_worked), 0) AS total_hours_worked -- Renombrado para coincidir con TS
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.budget
HAVING COUNT(pa.employee_id) > 0;

-- VISTA 3: Altos Salarios (NOMBRE CORREGIDO: vw_high_salary_analysis)
CREATE OR REPLACE VIEW vw_high_salary_analysis AS
WITH CompanyStats AS (
    SELECT AVG(salary) as global_avg_salary FROM employees
)
SELECT 
    e.id AS employee_id,
    e.first_name, 
    e.last_name,
    e.position,
    e.salary,
    d.name AS department_name,
    CASE 
        WHEN e.salary > (SELECT global_avg_salary * 1.5 FROM CompanyStats) THEN 'High Earner'
        ELSE 'Above Average'
    END AS salary_status
FROM employees e
JOIN departments d ON e.department_id = d.id
CROSS JOIN CompanyStats cs
WHERE e.salary > cs.global_avg_salary;

-- VISTA 4: Salud Presupuestal (Sin cambios)
CREATE OR REPLACE VIEW vw_budget_health AS
SELECT 
    d.id AS department_id, -- Renombrado para coincidir con TS (antes dept_id)
    d.name AS department_name,
    d.budget AS total_budget,
    COALESCE(SUM(p.budget), 0) AS committed_budget,
    (d.budget - COALESCE(SUM(p.budget), 0)) AS remaining_budget,
    CASE 
        WHEN (d.budget - COALESCE(SUM(p.budget), 0)) < 0 THEN 'Over Budget (Deficit)'
        WHEN (d.budget - COALESCE(SUM(p.budget), 0)) < (d.budget * 0.2) THEN 'Critical (<20%)'
        ELSE 'Healthy'
    END AS budget_status
FROM departments d
LEFT JOIN projects p ON d.id = p.department_id
GROUP BY d.id, d.name, d.budget;

-- VISTA 5: Ranking (NOMBRE CORREGIDO: vw_employee_productivity_rank)
CREATE OR REPLACE VIEW vw_employee_productivity_rank AS
SELECT 
    e.id AS employee_id,
    e.first_name || ' ' || e.last_name AS full_name, -- Renombrado para coincidir con TS
    p.name AS project_name,
    pa.hours_worked,
    DENSE_RANK() OVER (
        PARTITION BY p.id 
        ORDER BY pa.hours_worked DESC
    ) as productivity_rank
FROM employees e
JOIN project_assignments pa ON e.id = pa.employee_id
JOIN projects p ON pa.project_id = p.id
WHERE p.status = 'active';