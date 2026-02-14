-- db/05_roles.sql (CORREGIDO)
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_user') THEN
      CREATE ROLE dashboard_user WITH LOGIN PASSWORD 'secure_password_123';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE postgres TO dashboard_user;
GRANT USAGE ON SCHEMA public TO dashboard_user;

-- Revocar permisos en tablas base
REVOKE ALL ON employees FROM dashboard_user;
REVOKE ALL ON departments FROM dashboard_user;
REVOKE ALL ON projects FROM dashboard_user;
REVOKE ALL ON project_assignments FROM dashboard_user;

-- Dar permisos a las vistas con los NUEVOS nombres
GRANT SELECT ON vw_department_metrics TO dashboard_user;
GRANT SELECT ON vw_active_projects TO dashboard_user;           -- Corregido
GRANT SELECT ON vw_high_salary_analysis TO dashboard_user;      -- Corregido
GRANT SELECT ON vw_budget_health TO dashboard_user;
GRANT SELECT ON vw_employee_productivity_rank TO dashboard_user; -- Corregido