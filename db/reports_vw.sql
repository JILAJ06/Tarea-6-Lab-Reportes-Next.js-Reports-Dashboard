-- ==============================================================================
-- VISTA 1: Métricas de Departamentos (General)
-- ==============================================================================
-- DESCRIPCIÓN: Resumen de personal y costos salariales por departamento.
-- GRAIN: 1 fila por Departamento.
-- MÉTRICAS: 
--   - Total Empleados (COUNT)
--   - Salario Promedio (AVG)
--   - Costo Mensual Total (SUM)
-- GROUP BY: Agrupa empleados por su ID de departamento.
-- VERIFY:
--   SELECT * FROM vw_department_metrics WHERE employee_count > 0;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_department_metrics AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(e.id) AS employee_count,
    COALESCE(SUM(e.salary), 0) AS total_monthly_payroll,
    ROUND(AVG(e.salary), 2) AS average_salary,
    -- Campo calculado: % del presupuesto usado en salarios (anualizado vs presupuesto)
    CASE 
        WHEN d.budget > 0 THEN ROUND((SUM(e.salary) * 12 / d.budget) * 100, 1)
        ELSE 0 
    END AS budget_usage_pct
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
GROUP BY d.id, d.name, d.budget;

-- ==============================================================================
-- VISTA 2: Carga de Proyectos Activos (HAVING)
-- ==============================================================================
-- DESCRIPCIÓN: Muestra proyectos activos que tienen personal asignado y horas registradas.
-- GRAIN: 1 fila por Proyecto.
-- MÉTRICAS:
--   - Total Empleados Asignados
--   - Horas Totales Invertidas
-- GROUP BY / HAVING: 
--   Agrupa por proyecto.
--   HAVING filtra proyectos "fantasmas" (sin empleados o sin horas registradas).
-- VERIFY:
--   SELECT * FROM vw_active_projects_load;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_active_projects_load AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.end_date,
    d.name AS department_owner,
    COUNT(DISTINCT pa.employee_id) AS assigned_staff,
    SUM(pa.hours_worked) AS total_hours_consumed,
    -- Semáforo de estado basado en fecha
    CASE 
        WHEN p.end_date < CURRENT_DATE THEN 'Overdue'
        WHEN p.end_date < CURRENT_DATE + 30 THEN 'Urgent'
        ELSE 'On Track'
    END AS time_status
FROM projects p
JOIN departments d ON p.department_id = d.id
JOIN project_assignments pa ON p.id = pa.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.end_date, d.name
HAVING COUNT(pa.employee_id) > 0;

-- ==============================================================================
-- VISTA 3: Análisis de Salarios Altos (CTE + Complex Logic)
-- ==============================================================================
-- DESCRIPCIÓN: Identifica empleados que ganan más que el promedio de su propio depto.
-- GRAIN: 1 fila por Empleado.
-- MÉTRICAS: Comparativa Salario vs Promedio Depto.
-- USO DE CTE (WITH): 
--   Calcula primero el promedio por departamento en una tabla temporal.
-- VERIFY:
--   SELECT * FROM vw_salary_analysis WHERE salary_diff_pct > 20;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_salary_analysis AS
WITH DeptStats AS (
    SELECT 
        department_id, 
        AVG(salary) as avg_dept_salary
    FROM employees
    GROUP BY department_id
)
SELECT 
    e.id AS employee_id,
    e.first_name || ' ' || e.last_name AS full_name,
    e.position,
    d.name AS department_name,
    e.salary,
    ROUND(ds.avg_dept_salary, 2) AS dept_average,
    -- Cálculo: Cuánto por encima del promedio está (en %)
    ROUND(((e.salary - ds.avg_dept_salary) / ds.avg_dept_salary * 100), 1) AS salary_diff_pct
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN DeptStats ds ON e.department_id = ds.department_id
WHERE e.salary > ds.avg_dept_salary;

-- ==============================================================================
-- VISTA 4: Salud Financiera del Departamento (COALESCE)
-- ==============================================================================
-- DESCRIPCIÓN: Calcula el presupuesto restante real de cada área.
-- GRAIN: 1 fila por Departamento.
-- MÉTRICAS: Presupuesto Restante.
-- USO DE COALESCE: 
--   Evita que la resta devuelva NULL si un departamento no tiene proyectos.
-- VERIFY:
--   SELECT * FROM vw_budget_health WHERE status = 'Critical';
-- ==============================================================================
CREATE OR REPLACE VIEW vw_budget_health AS
SELECT 
    d.id AS dept_id,
    d.name AS dept_name,
    d.budget AS total_budget,
    COALESCE(SUM(p.budget), 0) AS committed_budget,
    (d.budget - COALESCE(SUM(p.budget), 0)) AS remaining_budget,
    -- Lógica de Negocio: Clasificación de Salud Financiera
    CASE 
        WHEN (d.budget - COALESCE(SUM(p.budget), 0)) < 0 THEN 'Over Budget (Deficit)'
        WHEN (d.budget - COALESCE(SUM(p.budget), 0)) < (d.budget * 0.2) THEN 'Critical (<20%)'
        ELSE 'Healthy'
    END AS status
FROM departments d
LEFT JOIN projects p ON d.id = p.department_id
GROUP BY d.id, d.name, d.budget;

-- ==============================================================================
-- VISTA 5: Ranking de Productividad (Window Function)
-- ==============================================================================
-- DESCRIPCIÓN: Top empleados con más horas trabajadas POR PROYECTO.
-- GRAIN: 1 fila por Asignación.
-- MÉTRICAS: Rank (1, 2, 3...).
-- USO DE WINDOW FUNCTION: 
--   DENSE_RANK() OVER (PARTITION BY project_name...): Reinicia el top para cada proyecto.
-- VERIFY:
--   SELECT * FROM vw_project_productivity_rank WHERE rank_position <= 3;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_project_productivity_rank AS
SELECT 
    p.name AS project_name,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.position,
    pa.hours_worked,
    -- Ranking denso reiniciado por cada proyecto
    DENSE_RANK() OVER (
        PARTITION BY p.name 
        ORDER BY pa.hours_worked DESC
    ) as rank_position
FROM projects p
JOIN project_assignments pa ON p.id = pa.project_id
JOIN employees e ON pa.employee_id = e.id
WHERE p.status = 'active';