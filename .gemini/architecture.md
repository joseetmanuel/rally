
# architecture.md
## Arquitectura del sistema

Este documento define cómo debo respetar la arquitectura del proyecto.

---

# Estilo de arquitectura

El sistema utiliza una **arquitectura por capas simple**.

Frontend (Angular)
↓
REST API (Flask)
↓
PostgreSQL

---

# Backend

Estructura recomendada:

rally-back/

app.py
routes/
services/
repositories/
models/

Responsabilidades:

routes → endpoints HTTP  
services → lógica de negocio  
repositories → consultas a base de datos  
models → estructuras de datos

Debo mantener esta separación.

---

# Frontend

rally-app/

components/
services/
models/

Responsabilidades:

components → interfaz de usuario  
services → comunicación con API  
models → interfaces TypeScript

---

# Principios

Debo priorizar:

- simplicidad
- claridad
- mantenibilidad

Debo evitar:

- abstracciones innecesarias
- microservicios
- complejidad prematura
