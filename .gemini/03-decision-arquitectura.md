# Rally de Certificaciones – Decisión de Arquitectura

## Propósito

Este documento registra las **decisiones de arquitectura del MVP del sistema Rally de Certificaciones**, incluyendo:

- stack tecnológico
- enfoque de desarrollo
- decisiones de simplicidad
- preparación para despliegue futuro

El objetivo es garantizar que el proyecto se mantenga **simple, funcional y evolutivo**, evitando complejidad innecesaria en el MVP.

---

# Principio rector del proyecto

El desarrollo del MVP se regirá por el principio:

> **Primero funcional, después perfecto.**

Esto significa:

- evitar sobrearquitectura
- reducir dependencias innecesarias
- priorizar claridad del código
- permitir evolución futura sin bloquear el avance actual

---

# Decisión 1 — Backend nuevo desde cero

## Contexto

Inicialmente se intentó utilizar un **arquetipo backend existente en Python**.

Durante el análisis se detectaron problemas como:

- inconsistencias en rutas
- prefijos duplicados en endpoints
- documentación Swagger no alineada con las rutas reales
- validación de headers poco clara
- endpoints de ejemplo que retornaban errores
- dificultad para entender el flujo real del arquetipo

Esto implicaba invertir tiempo significativo **domesticando el arquetipo antes de comenzar el desarrollo real del MVP**.

## Decisión

Se decidió **no utilizar el arquetipo backend existente**.

En su lugar se desarrollará un **backend nuevo desde cero**, con el objetivo de:

- simplificar el desarrollo
- mantener control total del código
- evitar deuda técnica heredada
- acelerar la entrega del MVP

---

# Decisión 2 — Stack del backend

El backend del MVP utilizará el siguiente stack:

| Componente | Tecnología |
|---|---|
| Lenguaje | Python |
| Framework API | Flask |
| ORM | SQLAlchemy |
| Base de datos | PostgreSQL |
| Serialización | JSON |
| Documentación | Swagger / OpenAPI (fase posterior) |

## Justificación

Flask permite:

- simplicidad
- rapidez de desarrollo
- fácil despliegue en contenedores
- integración directa con SQLAlchemy
- control completo sobre la arquitectura

---

# Decisión 3 — Arquitectura del backend

El backend seguirá una estructura simple pero ordenada.

Ejemplo de estructura:

```
backend/
│
├── app.py
├── config.py
├── database.py
│
├── models/
│ ├── consultant.py
│ ├── certification.py
│ ├── course_session.py
│
├── repositories/
│
├── services/
│
├── routes/
│ ├── consultants.py
│ ├── certifications.py
│ ├── courses.py
│ ├── ranking.py
│
└── schemas/
```

### Principios

- separación clara entre:
  - modelos
  - lógica de negocio
  - endpoints
- evitar patrones excesivamente complejos
- mantener el backend comprensible para un equipo pequeño

---

# Decisión 4 — Frontend

## Contexto

Existe un **arquetipo frontend en Angular** disponible.

A diferencia del backend, el frontend **sí logra levantarse correctamente**.

## Estrategia

Se realizará una **evaluación rápida del arquetipo Angular**.

Si el arquetipo permite:

- crear nuevas páginas fácilmente
- integrar servicios HTTP simples
- mantener una estructura clara

entonces **se utilizará como base del frontend**.

---

# Regla de abandono del arquetipo frontend

Si durante la evaluación se detecta:

- complejidad innecesaria
- dependencias rotas
- configuración difícil de mantener
- patrones inconsistentes

entonces se tomará la decisión de:

> **crear un frontend Angular nuevo desde cero**

El MVP no depende del arquetipo.

---

# Decisión 5 — Preparación para cloud

Aunque el MVP se ejecutará inicialmente **en local**, la arquitectura se diseñará pensando en un despliegue futuro en cloud.

El objetivo es permitir despliegue posterior en:

- **Google Cloud Run**
- u otro entorno basado en contenedores

## Implicaciones

El backend debe poder ejecutarse como:

```
container -> API -> PostgreSQL
```

Esto implica:

- configuración por variables de entorno
- no depender de rutas locales rígidas
- facilidad para dockerizar la aplicación

---

# Decisión 6 — Autenticación

El MVP **no implementará autenticación compleja**.

Razones:

- reducir fricción en el desarrollo
- priorizar funcionalidad del sistema de puntos

Opciones futuras:

- autenticación corporativa
- integración con Azure AD
- login con OAuth

---

# Decisión 7 — API REST simple

El backend expondrá endpoints REST simples.

Ejemplo conceptual:

```
GET /consultants
POST /consultants

GET /certifications
POST /certifications

GET /courses
POST /courses

GET /ranking
```

El objetivo es que el frontend pueda consumir la API **sin lógica innecesariamente compleja**.

---

# Decisión 8 — Base de datos

Se utilizará **PostgreSQL**.

Razones:

- robustez
- buen soporte en cloud
- integración natural con SQLAlchemy
- fácil migración futura

---

# Decisión 9 — Evolución futura

La arquitectura permitirá agregar posteriormente:

- autenticación
- dashboards avanzados
- ranking por equipos
- análisis históricos
- notificaciones
- panel administrativo

El diseño del MVP busca **no bloquear estas evoluciones futuras**.

---

# Conclusión

El MVP del Rally se desarrollará con una arquitectura basada en:

- **backend simple construido desde cero**
- **frontend Angular evaluando el arquetipo existente**
- **modelo de datos claro**
- **API REST sencilla**

La prioridad del proyecto es:

> entregar un sistema funcional que permita validar el modelo del Rally de Certificaciones.
