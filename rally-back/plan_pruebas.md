# Plan de Pruebas Automatizadas – Rally Backend (MVP)

Este documento define la estrategia, herramientas y fases para la implementación de pruebas automatizadas en el backend del proyecto Rally.

## 1. Estrategia de Testing

El objetivo es asegurar que la API sea robusta, que las reglas de negocio (puntos y ranking) se cumplan y que no existan regresiones al agregar nuevas funcionalidades.

### Pilares de la Estrategia:
- **Pirámide de Pruebas:** Foco en Pruebas de Integración (API Endpoints) y Pruebas Unitarias (Services).
- **Aislamiento:** Uso de una base de datos de pruebas independiente.
- **Automatización:** Ejecución simple mediante un solo comando.

---

## 2. Herramientas Recomendadas (Stack Python)

- **pytest:** Framework principal de pruebas.
- **pytest-flask:** Plugin para facilitar el testing de aplicaciones Flask.
- **pytest-cov:** Generación de reportes de cobertura.
- **factory-boy:** Generación de datos de prueba (opcional, para agilizar).

---

## 3. Fases de Implementación

### Fase 1: Infraestructura y Base (Semana 1)
Configuración del entorno de pruebas sin tocar el código productivo.
- Creación de carpeta `tests/` en la raíz de `rally-back/`.
- Implementación de `conftest.py`:
  - Fixture `app`: Configuración de la app en modo testing.
  - Fixture `db`: Setup y teardown de la base de datos de pruebas (PostgreSQL).
  - Fixture `client`: Cliente de pruebas de Flask para realizar peticiones.

### Fase 2: Pruebas de Endpoints de Catálogo (Semana 1)
Validación de los CRUDs básicos (Fases 1 y 2 del Roadmap).
- **Consultants:** Crear, listar, obtener por ID, actualizar y borrar.
- **Certification Types:** Validar que los puntos base se guarden correctamente.
- **Certifications:** Validar la relación con el tipo de certificación.
- **Extra Point Reason Types:** Validar catálogos base.

### Fase 3: Pruebas de Integración de Negocio (Semana 2)
Validación de los flujos de registro que impactan puntos (Fases 3 a 5 del Roadmap).
- **Consultant Certifications:** Probar registro de certificaciones obtenidas.
- **Course Sessions & Attendances:** Validar registro de asistencia y sesiones.
- **Consultant Extra Points:** Validar inserción de puntos manuales y automáticos.

### Fase 4: Validación del Motor de Ranking (Semana 2)
El corazón del sistema. Pruebas exhaustivas sobre el `RankingService`.
- **Cálculo de Puntos:**
  - Caso A: Consultor con solo certificaciones.
  - Caso B: Consultor con certificaciones + puntos extra.
  - Caso C: Escenario complejo (Expositor + Alumno + Puntos Extra).
- **Ordenamiento del Ranking:**
  - Validar orden descendente por puntos.
  - Validar criterios de desempate (Regla 7: # certificaciones, fecha reciente).

### Fase 5: Reporteo y Robustez (Semana 3)
Finalización y calidad.
- **Validación de Esquemas:** Asegurar que los JSON de respuesta coinciden con lo documentado.
- **Manejo de Errores:** Probar 404 (no encontrado), 400 (datos inválidos), 409 (duplicados).
- **Reporte de Cobertura:** Alcanzar al menos un 80% de cobertura en la carpeta `routes/` y `services/`.

---

## 4. Ejecución de Pruebas

Una vez implementadas, las pruebas se ejecutarán de la siguiente manera:

```bash
# Instalar dependencias de testing
pip install pytest pytest-flask pytest-cov

# Ejecutar todas las pruebas
pytest

# Ejecutar con reporte de cobertura
pytest --cov=routes --cov=services
```

---

## 5. Casos de Prueba Críticos (Must-Have)

| ID | Componente | Descripción | Resultado Esperado |
|---|---|---|---|
| T-001 | Consultant | Crear consultor con email duplicado | Error 400/409 |
| T-002 | Certification | Asignar tipo inexistente a certificación | Error 400 |
| T-003 | Ranking | Consultor sin actividad | 0 puntos en ranking |
| T-004 | Rule 4 | Alumno se certifica tras curso | Puntos extra para Alumno y Expositor |
| T-005 | Security | Intento de inyección SQL en endpoints de búsqueda | Sanitización correcta |

---

## 6. Conclusión

Este plan permite una transición segura hacia un backend con calidad garantizada. Al seguir un enfoque incremental, el equipo de desarrollo puede validar cada pieza del MVP antes de pasar a la fase de despliegue en Cloud.
