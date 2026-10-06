
# tasks.md
## Task Guide

Este archivo guía mi trabajo dentro del proyecto.

Debo trabajar **tarea por tarea**, evitando modificar muchas partes del sistema al mismo tiempo.

---

# Orden recomendado de desarrollo (MVP)

1. consultants
2. certification_types
3. certifications
4. consultant_certifications
5. course_sessions
6. course_attendances
7. extra_point_reason_types
8. consultant_extra_points
9. ranking

---

# Plantilla de tarea

Cuando implemente una funcionalidad debo estructurarla así:

## Nombre de la tarea
Descripción corta.

## Objetivo
Qué debe lograr la funcionalidad.

## Cambios en Backend
- endpoints
- servicios
- queries

## Cambios en Frontend
- componentes
- servicios
- UI

## Cambios en Base de Datos
Solo si son necesarios.

---

# Ejemplo

## Tarea
Listar consultores

## Backend
GET /consultants

## Frontend
list-consultants.component.ts

## Base de datos
Lectura de tabla consultants
