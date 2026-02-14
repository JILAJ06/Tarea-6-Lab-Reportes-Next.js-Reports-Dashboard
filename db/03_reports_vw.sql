-- Vistas Materializadas Lógicamente para Dashboard Corporativo

-- ==============================================================================
-- VISTA 1: Métricas por Departamento
-- ==============================================================================
-- DESCRIPCIÓN: Resumen financiero y de personal por departamento.
-- GRAIN: 1 fila por Departamento.
-- MÉTRICAS: Total empleados, Costo nómina, Promedio salarial, % Uso Presupuesto.
-- JUSTIFICACIÓN:
--   - GROUP BY: Necesario para agregar empleados por departamento.
--   - HAVING: (Regla PDF) Filtramos departamentos que tienen al menos 1 empleado activo.
-- VERIFY: SELECT * FROM vw_department_metrics WHERE employee_count > 5;
-- ==============================================================================
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
GROUP BY d.id, d.name, d.budget
HAVING COUNT(e.id) > 0;  -- <--- CUMPLIMIENTO REGLA 2 VISTAS CON HAVING

-- ==============================================================================
-- VISTA 2: Proyectos Activos
-- ==============================================================================
-- DESCRIPCIÓN: Carga de trabajo y costos de proyectos en curso.
-- GRAIN: 1 fila por Proyecto.
-- MÉTRICAS: Total empleados asignados, Horas consumidas, Presupuesto.
-- JUSTIFICACIÓN:
--   - HAVING: Filtrar proyectos "fantasmas" sin empleados asignados.
-- VERIFY: SELECT * FROM vw_active_projects ORDER BY budget DESC;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_active_projects AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.budget,
    COUNT(DISTINCT pa.employee_id) AS assigned_employees,
    COALESCE(SUM(pa.hours_worked), 0) AS total_hours_worked
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.budget
HAVING COUNT(pa.employee_id) > 0;

-- ==============================================================================
-- VISTA 3: Análisis de Altos Salarios
-- ==============================================================================
-- DESCRIPCIÓN: Identificación de empleados 'High Earners' vs promedio global.
-- GRAIN: 1 fila por Empleado.
-- MÉTRICAS: Salario individual, Estatus calculado.
-- JUSTIFICACIÓN:
--   - CTE (WITH): Requerido para calcular el promedio global una sola vez antes del join.
-- VERIFY: SELECT * FROM vw_high_salary_analysis WHERE salary_status = 'High Earner';
-- ==============================================================================
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
    -- Uso de CASE para lógica de negocio compleja
    CASE 
        WHEN e.salary > (SELECT global_avg_salary * 1.5 FROM CompanyStats) THEN 'High Earner'
        ELSE 'Above Average'
    END AS salary_status
FROM employees e
JOIN departments d ON e.department_id = d.id
CROSS JOIN CompanyStats cs
WHERE e.salary > cs.global_avg_salary;

-- ==============================================================================
-- VISTA 4: Salud Presupuestal
-- ==============================================================================
-- DESCRIPCIÓN: Disponibilidad de fondos restando costos proyectados.
-- GRAIN: 1 fila por Departamento.
-- MÉTRICAS: Presupuesto restante, Semáforo de estado.
-- JUSTIFICACIÓN:
--   - COALESCE: Manejo de nulos en restas aritméticas.
-- VERIFY: SELECT * FROM vw_budget_health WHERE remaining_budget < 0;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_budget_health AS
SELECT 
    d.id AS department_id,
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

-- ==============================================================================
-- VISTA 5: Ranking de Productividad
-- ==============================================================================
-- DESCRIPCIÓN: Leaderboard de empleados por horas trabajadas por proyecto.
-- GRAIN: 1 fila por Asignación.
-- MÉTRICAS: Posición en ranking (1, 2, 3...).
-- JUSTIFICACIÓN:
--   - WINDOW FUNCTION (DENSE_RANK): Requerido para reiniciar el conteo por grupo (Partition).
-- VERIFY: SELECT * FROM vw_employee_productivity_rank WHERE productivity_rank = 1;
-- ==============================================================================
CREATE OR REPLACE VIEW vw_employee_productivity_rank AS
SELECT 
    e.id AS employee_id,
    e.first_name || ' ' || e.last_name AS full_name,
    p.name AS project_name,
    pa.hours_worked,
    -- Window Function obligatoria
    DENSE_RANK() OVER (
        PARTITION BY p.id 
        ORDER BY pa.hours_worked DESC
    ) as productivity_rank
FROM employees e
JOIN project_assignments pa ON e.id = pa.employee_id
JOIN projects p ON pa.project_id = p.id
WHERE p.status = 'active';