# Rally de Certificaciones - Backend (Cloud Ready)

Este es el backend del MVP para el proyecto Rally de Certificaciones.

## Requisitos

- Python 3.9+
- PostgreSQL

## Arquitectura de Configuración

Este proyecto sigue principios profesionales de despliegue en la nube. La configuración se basa exclusivamente en **variables de entorno**:

- En **desarrollo local**, las variables se cargan desde un archivo `.env` (creado manualmente, nunca commiteado).
- En **producción (Cloud)**, las variables serán inyectadas por el entorno de ejecución o gestionadas mediante herramientas de secretos (ej. GCP Secret Manager).

## Configuración Local

1.  **Crear entorno virtual e instalar dependencias:**
    ```bash
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```

2.  **Configurar archivo .env:**
    Crea un archivo `.env` en la raíz de `rally-back/` con los siguientes parámetros:
    ```bash
    FLASK_ENV=development
    PORT=5000
    DB_USER=tu_usuario
    DB_PASSWORD=tu_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=rally_db
    ```

## Base de Datos y Migraciones

1.  **Crear Base de Datos en PostgreSQL local.**
2.  **Inicializar y aplicar esquema:**
    ```bash
    $env:FLASK_APP="app.py"
    flask db upgrade
    ```
    *Nota: Si es la primera vez, usa `flask db init` y `flask db migrate`. Para actualizaciones de esquema, usa `flask db migrate` seguido de `flask db upgrade`.*

3.  **Cargar Catálogos Base (Seed):**
    Para poblar las tablas de catálogos (`certification_types` y `extra_point_reason_types`) con los valores iniciales de negocio:
    ```bash
    python seed.py
    ```
    Este script es idempotente (puede ejecutarse varias veces sin duplicar datos).

## Ejecución y Pruebas

1.  **Levantar el backend:**
    ```bash
    python app.py
    ```

## Validación de Salud y Catálogos:
- `GET http://localhost:5000/health/db`: Verifica conexión a la BD.
- `GET http://localhost:5000/health/schema`: Verifica que las tablas existan.
- `GET http://localhost:5000/health/catalogs`: Verifica que los catálogos estén cargados y que la columna `points_for_course` esté presente.

## Recursos CRUD (API REST)
Todos los recursos están disponibles bajo el prefijo `/api`.

### Endpoints Generales por Recurso:
- `GET /api/<recurso>`: Listar todos (ordenados por ID asc).
- `GET /api/<recurso>/<id>`: Obtener detalle por ID.
- `POST /api/<recurso>`: Crear nuevo registro.
- `PUT /api/<recurso>/<id>`: Actualizar registro existente.
- `DELETE /api/<recurso>/<id>`: Eliminar registro.

### Recursos Disponibles y Payloads (POST):

#### 1. Consultants (`/api/consultants`)
```json
{
  "full_name": "Juan Pérez",
  "participant_type": "INTERNO",
  "team_number": 1,
  "consulting_firm_name": "Firma A",
  "email": "juan@example.com",
  "teams_contact": "juan.perez"
}
```

#### 2. Certification Types (`/api/certification-types`)
```json
{
  "code": "NUEVO_TIPO",
  "points_base": 10,
  "points_for_course": 5,
  "points_for_instructor": 2,
  "points_for_student": 1
}
```

#### 3. Certifications (`/api/certifications`)
```json
{
  "vendor": "Microsoft",
  "name": "AZ-900",
  "certification_type_id": 1
}
```

#### 4. Consultant Certifications (`/api/consultant-certifications`)
```json
{
  "consultant_id": 1,
  "certification_id": 1,
  "obtained_at": "2024-03-12",
  "reimbursement_amount": 150.00,
  "paid_with_own_resources": true,
  "notes": "Certificación inicial"
}
```

#### 5. Course Sessions (`/api/course-sessions`)
```json
{
  "certification_id": 1,
  "instructor_consultant_id": 1,
  "session_date": "2024-03-15",
  "title": "Taller de Preparación AZ-900",
  "notes": "Sesión remota"
}
```

#### 6. Course Attendances (`/api/course-attendances`)
```json
{
  "course_session_id": 1,
  "consultant_id": 2,
  "points_obtained": 5,
  "notes": "Asistencia completa"
}
```

#### 7. Extra Point Reason Types (`/api/extra-point-reason-types`)
```json
{
  "code": "PREMIO_ESPECIAL",
  "name": "Premio Especial",
  "description": "Puntos por ganar concurso interno"
}
```

#### 8. Consultant Extra Points (`/api/consultant-extra-points`)
```json
{
  "consultant_id": 1,
  "extra_point_reason_type_id": 1,
  "points": 10,
  "awarded_at": "2024-03-12T10:00:00",
  "notes": "Ganador dinámica marzo"
}
```

## Modelo de Datos - Certification Types

Se ha incluido la columna `points_for_course` (SmallInt) para otorgar puntos fijos al expositor por impartir un curso, independientemente de los puntos por instructor o estudiante.
