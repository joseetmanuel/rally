# Rally de Certificaciones – Roadmap MVP

## Propósito

Este documento define el **plan de desarrollo del MVP** del sistema Rally de Certificaciones.

El objetivo es construir el sistema en **iteraciones pequeñas**, priorizando:

- funcionalidad
- simplicidad
- rapidez de implementación
- validación temprana del modelo de puntos

---

# Estrategia general

El desarrollo se dividirá en **fases incrementales**.

Cada fase debe producir un sistema **ejecutable y usable**, aunque sea limitado.

Principios:

- construir primero lo esencial
- evitar dependencias innecesarias
- validar reglas de negocio lo antes posible
- iterar rápidamente

---

# Fase 0 — Preparación del proyecto

## Objetivo

Dejar el entorno base listo para comenzar el desarrollo.

## Backend

- crear repositorio del backend
- crear proyecto Flask
- configurar SQLAlchemy
- configurar conexión a PostgreSQL
- crear estructura básica del proyecto
- configurar variables de entorno

## Frontend

- levantar el proyecto Angular existente
- validar que compile y se ejecute
- revisar estructura del proyecto
- identificar dónde agregar nuevas páginas

## Resultado esperado

- backend ejecutándose localmente
- frontend ejecutándose localmente
- conexión frontend → backend lista para probar

---

# Fase 1 — Catálogos base

## Objetivo

Crear las entidades base necesarias para el sistema.

## Backend

Implementar endpoints para:

### Consultores
```
GET /consultants
POST /consultants
```
### Tipos de certificación

```
GET /certification-types
POST /certification-types
```

### Certificaciones

```
GET /certifications
POST /certifications
```

### Motivos de puntos extra

```
GET /extra-point-reasons
POST /extra-point-reasons
```


## Frontend

Pantallas iniciales:

- listado de consultores
- registro de consultor
- listado de certificaciones
- registro de certificación

## Resultado esperado

Sistema capaz de:

- registrar consultores
- registrar certificaciones
- registrar tipos de certificación

---

# Fase 2 — Certificaciones obtenidas

## Objetivo

Registrar certificaciones obtenidas por consultores.

## Backend

Endpoints:

```
POST /consultant-certifications
GET /consultant-certifications
```


Funcionalidad:

- registrar certificación obtenida
- almacenar fecha
- almacenar información de reembolso
- consultar certificaciones por consultor

## Frontend

Pantallas:

- registrar certificación obtenida
- listado de certificaciones por consultor

## Resultado esperado

El sistema puede registrar certificaciones obtenidas.

---

# Fase 3 — Cursos

## Objetivo

Registrar sesiones de cursos relacionadas con certificaciones.

## Backend

Endpoints:

```
POST /course-sessions
GET /course-sessions
```
Campos principales:

- certificación asociada
- expositor
- fecha

## Frontend

Pantallas:

- registro de curso
- listado de cursos

## Resultado esperado

El sistema puede registrar cursos impartidos.

---

# Fase 4 — Asistencia a cursos

## Objetivo

Registrar asistencia de consultores a cursos.

## Backend

Endpoints:

```
POST /course-attendances
GET /course-attendances
```

Campos:

- sesión de curso
- consultor
- puntaje de cuestionario

## Frontend

Pantallas:

- registrar asistencia a curso
- listar asistentes por curso

## Resultado esperado

El sistema puede registrar quién asistió a cada curso.

---

# Fase 5 — Puntos extra

## Objetivo

Registrar puntos extra otorgados a consultores.

## Backend

Endpoints:

```
POST /consultant-extra-points
GET /consultant-extra-points
```

Ejemplos de uso:

- puntos por curso
- puntos por participación
- puntos manuales

## Frontend

Pantallas:

- registrar puntos extra
- historial de puntos por consultor

## Resultado esperado

Sistema capaz de registrar puntos adicionales.

---

# Fase 6 — Ranking

## Objetivo

Construir el ranking de consultores.

## Backend

Endpoint:

```
GET /ranking
```

La respuesta debe incluir:

- consultor
- total de puntos
- número de certificaciones
- número de cursos

## Frontend

Pantalla principal:

**Ranking de consultores**

Mostrar:

| Posición | Consultor | Certificaciones | Cursos | Puntos |

## Resultado esperado

El sistema muestra el ranking completo.

---

# Fase 7 — Ajustes del MVP

## Objetivo

Mejorar usabilidad y consistencia del sistema.

Posibles mejoras:

- validaciones de formularios
- filtros en ranking
- búsqueda de consultores
- ordenamientos
- mejoras visuales

---

# Criterios de finalización del MVP

El MVP se considera completo cuando el sistema permite:

- registrar consultores
- registrar certificaciones
- registrar certificaciones obtenidas
- registrar cursos
- registrar asistencias
- registrar puntos extra
- visualizar el ranking

---

# Fase futura — Cloud

Una vez validado el MVP se podrá:

- dockerizar el backend
- desplegar en **Google Cloud Run**
- desplegar frontend en hosting estático
- integrar autenticación corporativa

---

# Conclusión

El roadmap busca construir el sistema en **pasos simples y controlados**.

Cada fase agrega funcionalidad útil sin bloquear el avance del proyecto.

El objetivo final es validar el modelo del **Rally de Certificaciones** con un sistema funcional y fácil de evolucionar.