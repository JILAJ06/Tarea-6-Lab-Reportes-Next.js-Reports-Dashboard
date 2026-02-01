CREATE OR REPLACE VIEW department_overview_vw AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    d.budget AS department_budget,
    COUNT(e.id) AS total_employees,
    COALESCE(SUM(e.salary), 0) AS total_salary_expense,
    COALESCE(ROUND(AVG(e.salary), 2), 0) AS avg_salary,
    CASE 
        WHEN d.budget > 0 THEN ROUND((COALESCE(SUM(e.salary), 0) / d.budget) * 100, 2)
        ELSE 0 
    END AS salary_budget_ratio
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
WHERE e.is_active = TRUE
GROUP BY d.id, d.name, d.budget;

CREATE OR REPLACE VIEW employee_workload_vw AS
SELECT
    e.id AS employee_id,
    e.first_name || ' ' || e.last_name AS full_name,
    d.name AS department,
    COUNT(pa.project_id) AS total_projects,
    COALESCE(SUM(pa.hours_worked), 0) AS total_hours_worked,
    CASE
        WHEN SUM(pa.hours_worked) > 400 THEN 'Critical Overload'
        WHEN SUM(pa.hours_worked) > 200 THEN 'High Load'
        ELSE 'Normal'
    END AS workload_status
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN project_assignments pa ON e.id = pa.employee_id
GROUP BY e.id, e.first_name, e.last_name, d.name
HAVING COUNT(pa.project_id) >= 1;

CREATE OR REPLACE VIEW project_status_performance_vw AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.status,
    p.budget,
    COUNT(pa.employee_id) AS assigned_staff,
    SUM(pa.hours_worked) AS total_hours_invested,
    CASE
        WHEN p.status = 'completed' AND p.end_date < CURRENT_DATE THEN 'Completed On Time'
        WHEN p.status = 'completed' THEN 'Completed Late'
        WHEN p.status = 'active' AND p.end_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'On Track'
    END AS timeline_status
FROM projects p
LEFT JOIN project_assignments pa ON p.id = pa.project_id
GROUP BY p.id, p.name, p.status, p.budget, p.end_date;

CREATE OR REPLACE VIEW salary_ranking_vw AS
SELECT
    e.id,
    e.first_name,
    e.last_name,
    d.name AS department,
    e.salary,
    DENSE_RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) as salary_rank_in_dept,
    ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY d.id), 2) as diff_from_dept_avg
FROM employees e
JOIN departments d ON e.department_id = d.id
WHERE e.is_active = TRUE;

CREATE OR REPLACE VIEW project_financial_cte_vw AS
WITH EmployeeHourlyRate AS (
    SELECT 
        id, 
        (salary / 2080) as hourly_cost
    FROM employees
)
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.budget AS allocated_budget,
    ROUND(SUM(pa.hours_worked * ehr.hourly_cost), 2) AS estimated_labor_cost,
    ROUND(p.budget - SUM(pa.hours_worked * ehr.hourly_cost), 2) AS budget_remaining,
    ROUND((SUM(pa.hours_worked * ehr.hourly_cost) / NULLIF(p.budget,0)) * 100, 2) AS percent_budget_used
FROM projects p
JOIN project_assignments pa ON p.id = pa.project_id
JOIN EmployeeHourlyRate ehr ON pa.employee_id = ehr.id
GROUP BY p.id, p.name, p.budget;