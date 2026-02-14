DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE  rolname = 'dashboard_user') THEN
      CREATE ROLE dashboard_user WITH LOGIN PASSWORD 'secure_password_123';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE postgres TO dashboard_user;
GRANT USAGE ON SCHEMA public TO dashboard_user;

REVOKE ALL ON employees FROM dashboard_user;
REVOKE ALL ON departments FROM dashboard_user;
REVOKE ALL ON projects FROM dashboard_user;
REVOKE ALL ON project_assignments FROM dashboard_user;

GRANT SELECT ON vw_department_metrics TO dashboard_user;        -- Vista 1
GRANT SELECT ON vw_active_projects_load TO dashboard_user;      -- Vista 2
GRANT SELECT ON vw_salary_analysis TO dashboard_user;           -- Vista 3
GRANT SELECT ON vw_budget_health TO dashboard_user;             -- Vista 4
GRANT SELECT ON vw_project_productivity_rank TO dashboard_user; -- Vista 5