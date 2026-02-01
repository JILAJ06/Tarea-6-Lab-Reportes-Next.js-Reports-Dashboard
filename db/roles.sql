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
GRANT SELECT ON department_overview_vw TO dashboard_user;
GRANT SELECT ON employee_workload_vw TO dashboard_user;
GRANT SELECT ON project_status_performance_vw TO dashboard_user;
GRANT SELECT ON salary_ranking_vw TO dashboard_user;
GRANT SELECT ON project_financial_cte_vw TO dashboard_user;