# Rally de Certificaciones – Resumen Ejecutivo

## Propósito del proyecto

Desarrollar una aplicación web interna para visualizar y gestionar un **ranking de consultores basado en certificaciones técnicas**, asistencia a cursos y contribuciones adicionales.

El sistema permitirá incentivar el aprendizaje continuo y reconocer el desarrollo profesional de los consultores mediante un sistema transparente de puntos.

Este proyecto inicia como un **MVP (Minimum Viable Product)** no oficial, con el objetivo de validar la idea, probar la experiencia de uso y evaluar su adopción dentro del equipo.

También se pretentde evaluar el uso de Gemini como Agente, evaluando el tiempo y dificultad de desarrollo combinado ChatGPT como apoyo arquitectonico y Gemini como "albañil" consturctor.

---

# Objetivos del MVP

El MVP busca resolver tres necesidades principales:

1. **Visualizar un ranking actualizado de consultores**
   - Basado en puntos acumulados por certificaciones, cursos y aportaciones.

2. **Registrar certificaciones obtenidas por consultores**
   - Asociadas a un valor de puntos definido por tipo de certificación.

3. **Permitir sumar puntos adicionales**
   - Por participación en cursos, eventos u otras contribuciones.

El objetivo inicial **no es crear una plataforma completa**, sino validar el funcionamiento del modelo de ranking.

---

# Alcance del MVP

El MVP incluirá las siguientes funcionalidades básicas:

## 1. Ranking de consultores
- Visualización del ranking general.
- Ordenado por puntaje total.
- Mostrar:
  - nombre del consultor
  - certificaciones
  - puntos acumulados

## 2. Gestión de certificaciones
- Registrar certificaciones obtenidas por consultores.
- Cada certificación tendrá:
  - nombre
  - tipo
  - valor de puntos

## 3. Registro de cursos
- Registrar asistencia a cursos internos.
- Los cursos podrán otorgar puntos.

## 4. Puntos adicionales
- Permitir sumar puntos manualmente por:
  - participación
  - eventos
  - contribuciones

---

# Fuera de alcance (por ahora)

Las siguientes funcionalidades **no forman parte del MVP**:

- autenticación corporativa
- integración con sistemas internos
- gestión avanzada de usuarios
- workflows de aprobación
- reportes avanzados
- administración compleja

Estas funciones podrán evaluarse en fases posteriores.

---

# Estrategia de desarrollo

El proyecto se desarrollará en **iteraciones rápidas**, priorizando simplicidad y funcionalidad.

Decisiones clave:

- Backend simple desarrollado **desde cero**.
- Frontend basado en **Angular (evaluando el arquetipo existente)**.
- Arquitectura preparada para un posible despliegue posterior en **Google Cloud Run** u otro entorno cloud.

El enfoque será:

> primero funcional, después perfecto.

---

# Público objetivo

El sistema está orientado principalmente a:

- consultores del equipo
- líderes técnicos
- responsables de capacitación
- interesados en visualizar el progreso profesional del equipo

---

# Resultado esperado

Al finalizar el MVP se espera contar con:

- un ranking funcional de consultores
- registro de certificaciones
- registro de cursos
- sistema simple de puntos
- un reporte de tiempo tomado de desarrollo que se integrara con el tiempo de los diferentes chats

Este MVP permitirá evaluar si el modelo de incentivo basado en certificaciones **genera valor real para el equipo**.