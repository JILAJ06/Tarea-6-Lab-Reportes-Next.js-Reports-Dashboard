# SIGA - Dashboard Corporativo (Next.js + PostgreSQL + Docker)

**Estudiante:** Alexander Jesús Jiménez León  
**Asignatura:** Base de Datos Avanzadas  
**Actividad:** Tarea 6 - Lab Reportes  

---

## 📋 Descripción del Proyecto
Aplicación empresarial para la visualización de datos estratégicos (RRHH, Finanzas y Proyectos). El sistema utiliza una arquitectura **SOA** donde la lógica de negocio pesada reside en la base de datos (Vistas Materializadas Lógicamente) y el frontend consume datos ya procesados.

---

## 🚀 Quick Start (One Command Run)

El proyecto cumple con el requisito de inicialización automática.

### 1️⃣ Configurar

```bash
cp .env.example .env
# Verificar que .env tenga:
# POSTGRES_PASSWORD=secret_postgres_password
```

### 2️⃣ Ejecutar

```bash
docker compose up --build
```

El sistema espera automáticamente a que la base de datos esté **healthy** antes de iniciar la aplicación web.

### 3️⃣ Accesos

- **Web:** http://localhost:3000  
- **DB:** localhost:5435  
  - User: `dashboard_user`  
  - Pass: `secure_password_123`  

---

## ⚖️ Trade-offs (Decisiones de Diseño)

### 📌 Cálculos en SQL (Vistas)

**Qué:**  
Agregaciones (`SUM`, `AVG`, `COUNT`), lógica condicional (`CASE`, `COALESCE`) y rankings (`DENSE_RANK`).

**Por qué:**  
El motor de base de datos está optimizado para operaciones matemáticas masivas en disco. Hacer estos cálculos en JavaScript implicaría traer miles de filas a memoria del servidor (Node.js) para iterarlas, lo cual es ineficiente (O(n)) y consume ancho de banda innecesario.

---

### 📌 Procesamiento en Next.js

**Qué:**  
Formateo de moneda (`Intl.NumberFormat`), renderizado de UI y paginación visual.

**Por qué:**  
La presentación es responsabilidad del cliente. SQL entrega el dato crudo (ej. `15000.00`) y el frontend decide si se muestra como `$15,000.00 MXN` o `€15.000,00` según el locale del usuario.

---

### 📌 Server Components

**Qué:**  
Fetching de datos directo en el componente.

**Por qué:**  
Seguridad. Al ejecutarse en el servidor, las credenciales de la base de datos nunca se exponen al navegador del cliente.

---

## 🔎 Performance Evidence (EXPLAIN ANALYZE)

Se crearon índices B-Tree (`db/04_indexes.sql`) para optimizar las consultas críticas.

---

### Evidencia 1: Filtro de Proyectos Activos (Vista 2)

**Query:**

```sql
EXPLAIN ANALYZE
SELECT * FROM projects WHERE status = 'active';
```

**Resultado:**

```text
Index Scan using idx_projects_status on projects  (cost=0.15..8.17 rows=1 width=578)
  Index Cond: ((status)::text = 'active'::text)
Planning Time: 0.284 ms
Execution Time: 0.045 ms
```

**Explicación:**  
Gracias al índice `idx_projects_status`, PostgreSQL realiza un *Index Scan* directo, ignorando proyectos terminados o archivados, reduciendo drásticamente la I/O al cargar el dashboard.

---

### Evidencia 2: Empleados por Departamento (Vista 1)

**Query:**

```sql
EXPLAIN ANALYZE
SELECT * FROM employees WHERE department_id = 1;
```

**Resultado:**

```text
Index Scan using idx_employees_dept on employees  (cost=0.14..8.16 rows=1 width=128)
  Index Cond: (department_id = 1)
```

**Explicación:**  
El índice `idx_employees_dept` permite que los `JOIN` y `GROUP BY` de la Vista 1 localicen empleados por departamento sin escanear toda la tabla.

---

## 🛡️ Threat Model (Modelo de Amenazas)

Estrategia de defensa en profundidad:

### 🔐 Prevención de SQL Injection
Se utiliza el driver `pg` con **consultas parametrizadas exclusivamente**:

```js
query('SELECT * FROM employees WHERE id = $1', [id])
```

Ningún input de usuario se concatena directamente al string SQL.

---

### 🔑 Gestión de Credenciales

- Las contraseñas NO existen en el código fuente.
- Se inyectan mediante variables de entorno (`.env`).
- El archivo `.env` está en `.gitignore`.

---

### 🧱 Principio de Mínimo Privilegio

- La aplicación usa el rol `dashboard_user` (`db/05_roles.sql`).
- Tiene **REVOCADOS** permisos sobre tablas base (`employees`, `projects`).
- Solo posee `GRANT SELECT` sobre las 5 vistas específicas.
- No puede ejecutar `DELETE`, `DROP` ni leer datos crudos sensibles.

---

## 🤖 Bitácora de IA

| Prompt Clave | Validación Humana | Corrección / Acción |
|--------------|------------------|---------------------|
| "Error: relation 'employees' does not exist en docker-entrypoint" | Revisé logs y noté que los scripts SQL corrían en orden alfabético. | Renombré los archivos con prefijos (`01_schema.sql`, `02_seed.sql`...) para forzar la secuencia correcta. |
| "Cómo hacer un ranking que se reinicie por grupo en Postgres" | `RANK()` generaba saltos (1,1,3). | Cambié a `DENSE_RANK()` para numeración continua (1,1,2). |
| "Genera un diseño moderno para el dashboard en Tailwind" | Colores muy saturados y tablas genéricas. | Ajusté la paleta a `Slate` e `Indigo` y unifiqué componentes. |
| "Consulta para obtener empleados con salario mayor al promedio" | Subquery repetía cálculo. | Refactoricé usando CTE (`WITH CompanyStats...`) para calcular el promedio una sola vez. |

---

## 📂 Estructura del Proyecto

```text
/
├── docker-compose.yml    # Orquestación con healthchecks
├── .env.example          # Plantilla de variables
├── README.md             # Documentación
├── db/
│   ├── 01_schema.sql     # Tablas (DDL)
│   ├── 02_seed.sql       # Datos (DML)
│   ├── 03_reports_vw.sql # Vistas (Lógica de Negocio)
│   ├── 04_indexes.sql    # Performance
│   └── 05_roles.sql      # Seguridad (Roles)
└── src/app/reports/      # Pantallas del Dashboard (Next.js)
```
