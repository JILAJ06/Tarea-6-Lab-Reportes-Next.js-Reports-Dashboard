# Tarea 6: Lab Reportes - Next.js Reports Dashboard

Este proyecto de negocios desarrollado con **Next.js (App Router)** y **PostgreSQL**, utilizando **Docker Compose** para la orquestación de contenedores.

El sistema visualiza métricas clave de la organización a través de **5 Vistas SQL** especializadas, asegurando que la aplicación web consuma datos pre-procesados y optimizados, sin acceso directo a las tablas transaccionales.

## Instrucciones de Ejecución

El proyecto está contenerizado para ejecutarse con un solo comando.

1. Tener **Docker Desktop** corriendo.
2. Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up --build