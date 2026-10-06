# Rally de Certificaciones – Estructura de Base de Datos para Backend

## Propósito

Este documento define la estructura de base de datos del MVP del sistema **Rally de Certificaciones**, enfocada en su implementación en backend con:

- PostgreSQL
- Python
- ORM (SQLAlchemy)

El objetivo es servir como referencia técnica para construir modelos, relaciones, validaciones y endpoints.

---

# Convenciones generales

## Base de datos objetivo
- Motor: PostgreSQL

## Convenciones sugeridas
- Nombres de tablas en plural y snake_case
- Llaves primarias con `id`
- Llaves foráneas con formato `<tabla_singular>_id`
- Campos de fecha tipo `date`
- Campos de fecha/hora tipo `timestamp`
- Campos monetarios tipo `numeric(12,2)`

---

# Tablas principales

El MVP contempla las siguientes tablas:

1. `consultants`
2. `certification_types`
3. `certifications`
4. `consultant_certifications`
5. `course_sessions`
6. `course_attendances`
7. `extra_point_reason_types`
8. `consultant_extra_points`

---

# 1. consultants

## Descripción
Catálogo de consultores o participantes del rally.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| full_name | varchar(200) | No | Nombre completo |
| participant_type | varchar(20) | No | INTERNO o EXTERNO |
| team_number | smallint | No | Número de equipo |
| consulting_firm_name | varchar(150) | Sí | Consultora, solo para externos |
| email | varchar(150) | Sí | Correo electrónico |
| teams_contact | varchar(255) | Sí | Contacto o identificador de Teams |

## Restricciones sugeridas
- PK: `id`
- Check: `participant_type in ('INTERNO', 'EXTERNO')`
- Check: `team_number > 0`

---

# 2. certification_types

## Descripción
Catálogo de tipos de certificación y sus puntajes.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | smallserial | No | PK |
| code | varchar(30) | No | Código del tipo |
| points_base | smallint | No | Puntos base por certificación |
| points_for_course | smallint | No | Puntos por impartir un curso para expositor |
| points_for_instructor | smallint | No | Puntos extra para expositor |
| points_for_student | smallint | No | Puntos extra para alumno |

## Datos de `code`
- FUNDACIONAL
- PROFESIONAL
- EXPERTO
- OPCIONAL

## Restricciones sugeridas
- PK: `id`
- Unique: `code`
- Check: `points_base >= 0`
- Check: `points_for_instructor >= 0`
- Check: `points_for_student >= 0`

---

# 3. certifications

## Descripción
Catálogo de certificaciones válidas para el rally.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| vendor | varchar(50) | No | Proveedor de la certificación |
| name | varchar(200) | No | Nombre de la certificación |
| certification_type_id | smallint | No | FK a certification_types |

## Restricciones sugeridas
- PK: `id`
- FK: `certification_type_id -> certification_types(id)`
- Unique: `(vendor, name)`

---

# 4. consultant_certifications

## Descripción
Registro de certificaciones obtenidas por consultores.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| consultant_id | bigint | No | FK a consultants |
| certification_id | bigint | No | FK a certifications |
| obtained_at | date | No | Fecha de obtención |
| reimbursement_amount | numeric(12,2) | Sí | Monto de reembolso |
| paid_with_own_resources | boolean | No | Si fue pagada con recursos propios |
| reimbursement_registered | boolean | No | Si ya fue registrado el reembolso |
| reimbursement_registered_at | timestamp | Sí | Fecha/hora de registro del reembolso |
| notes | varchar(500) | Sí | Observaciones |

## Restricciones sugeridas
- PK: `id`
- FK: `consultant_id -> consultants(id)`
- FK: `certification_id -> certifications(id)`
- Unique lógico: `(consultant_id, certification_id, obtained_at)`
- Check: `reimbursement_amount is null or reimbursement_amount >= 0`

## Reglas funcionales
- Una certificación válida puede detonar puntos extra.
- Esta tabla participa en el cálculo de puntos base.
- El curso relacionado debe haber ocurrido antes de `obtained_at` para detonar bonos.

---

# 5. course_sessions

## Descripción
Sesiones de curso asociadas a una certificación específica.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| certification_id | bigint | No | FK a certifications |
| instructor_consultant_id | bigint | No | FK a consultants |
| session_date | date | No | Fecha de la sesión |
| title | varchar(200) | Sí | Título del curso o sesión |
| notes | varchar(500) | Sí | Observaciones |

## Restricciones sugeridas
- PK: `id`
- FK: `certification_id -> certifications(id)`
- FK: `instructor_consultant_id -> consultants(id)`

## Reglas funcionales
- Una sesión tiene un solo expositor.
- Una sesión corresponde a una sola certificación.
- Un consultor no puede ser alumno y expositor en la misma sesión.

---

# 6. course_attendances

## Descripción
Asistencia de consultores a sesiones de curso.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| course_session_id | bigint | No | FK a course_sessions |
| consultant_id | bigint | No | FK a consultants |
| points_obtained | numeric(5,2) | Sí | Puntaje de cuestionario del curso |
| notes | varchar(500) | Sí | Observaciones |

## Restricciones sugeridas
- PK: `id`
- FK: `course_session_id -> course_sessions(id)`
- FK: `consultant_id -> consultants(id)`
- Unique: `(course_session_id, consultant_id)`
- Check: `points_obtained is null or points_obtained >= 0`

## Nota importante
`points_obtained` **NO son puntos del rally**.  
Representan el resultado de un cuestionario o evaluación al terminar el curso.

## Reglas funcionales
- Un consultor solo puede registrarse una vez por sesión.
- El consultor asistente no puede ser el expositor de esa sesión.

---

# 7. extra_point_reason_types

## Descripción
Catálogo de motivos de puntos extra.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | smallserial | No | PK |
| code | varchar(30) | No | Código del motivo |
| name | varchar(100) | No | Nombre del motivo |
| description | varchar(255) | Sí | Descripción opcional |

## Ejemplos de `code`
- COURSE
- MANUAL
- BONUS
- EVENT

## Restricciones sugeridas
- PK: `id`
- Unique: `code`

---

# 8. consultant_extra_points

## Descripción
Registro auditable de puntos extra otorgados a consultores.

## Campos

| Campo | Tipo PostgreSQL | Null | Descripción |
|---|---|---|---|
| id | bigserial | No | PK |
| consultant_id | bigint | No | FK a consultants |
| extra_point_reason_type_id | smallint | No | FK a extra_point_reason_types |
| awarded_at | date | No | Fecha de acreditación |
| points | smallint | No | Puntos otorgados |
| notes | varchar(500) | Sí | Explicación o motivo detallado |
| course_session_id | bigint | Sí | FK opcional a course_sessions |
| consultant_certification_id | bigint | Sí | FK opcional a consultant_certifications |

## Restricciones sugeridas
- PK: `id`
- FK: `consultant_id -> consultants(id)`
- FK: `extra_point_reason_type_id -> extra_point_reason_types(id)`
- FK: `course_session_id -> course_sessions(id)`
- FK: `consultant_certification_id -> consultant_certifications(id)`
- Check: `points >= 0`

## Reglas funcionales
- La tabla funciona como auditoría de puntos extra.
- Si una certificación genera bono para alumno y expositor, deben generarse dos registros separados.
- Puede usarse también para bonos manuales futuros.

---

# Relaciones del modelo

## Relaciones principales

- `certifications.certification_type_id -> certification_types.id`
- `consultant_certifications.consultant_id -> consultants.id`
- `consultant_certifications.certification_id -> certifications.id`
- `course_sessions.certification_id -> certifications.id`
- `course_sessions.instructor_consultant_id -> consultants.id`
- `course_attendances.course_session_id -> course_sessions.id`
- `course_attendances.consultant_id -> consultants.id`
- `consultant_extra_points.consultant_id -> consultants.id`
- `consultant_extra_points.extra_point_reason_type_id -> extra_point_reason_types.id`
- `consultant_extra_points.course_session_id -> course_sessions.id`
- `consultant_extra_points.consultant_certification_id -> consultant_certifications.id`

---

# Reglas de negocio que impactan el modelo

## Certificaciones
- Solo se registran certificaciones válidas del rally.
- Los puntos base dependen del tipo de certificación.

## Alumno
Un consultor puede recibir puntos extra como alumno:
- solo una vez por certificación
- solo si asistió antes a un curso asociado a esa certificación
- el curso debe ser anterior a la certificación

## Expositor
Un consultor puede recibir puntos extra como expositor:
- cada vez que un alumno de su curso sí logre certificarse después
- si un alumno tomó varios cursos de la misma certificación, los expositores relacionados pueden recibir puntos
- el alumno solo recibe una vez sus puntos como alumno por esa certificación

## Roles múltiples
Un mismo consultor sí puede recibir puntos:
- como alumno
- y también como expositor
para una misma certificación, siempre que no sea en la misma sesión.

---

# Cálculo conceptual del ranking

## Puntos totales
El puntaje total de un consultor se calcula como:

`puntaje_total = puntos_base_certificaciones + puntos_extra`

## Origen de los puntos
- `puntos_base_certificaciones`: salen de `consultant_certifications` + `certification_types.points_base`
- `puntos_extra`: salen de `consultant_extra_points.points`

---

# Orden recomendado de implementación en backend

1. `consultants`
2. `certification_types`
3. `certifications`
4. `consultant_certifications`
5. `course_sessions`
6. `course_attendances`
7. `extra_point_reason_types`
8. `consultant_extra_points`
9. `ranking`

---

# Nota para implementación ORM

Este modelo está pensado para traducirse directamente a:
- modelos SQLAlchemy
- migraciones o creación automática de tablas
- endpoints REST simples por recurso
- servicios de negocio para cálculo de puntos y ranking

El MVP no necesita aún:
- históricos complejos
- versionado de reglas
- vigencia de catálogos
- auditoría avanzada de cambios
- autenticación corporativa