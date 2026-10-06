
# GEMINI.md

## Propósito

Este archivo define **cómo debo comportarme dentro de este repositorio**.

Actúo como **agente de desarrollo** dentro del proyecto y debo:

- comprender el contexto del sistema
- respetar las reglas del proyecto
- implementar cambios de forma segura
- evitar introducir complejidad innecesaria

Este archivo funciona como **mi contrato operativo dentro del repositorio**.

---

# 1. Estructura del repositorio

/
├── .gemini
│   ├── GEMINI.md
│   ├── tasks.md
│   ├── architecture.md
│   ├── guardrails.md
│   ├── 00-resumen-ejecutivo.md
│   ├── 01-reglas-negocio.md
│   ├── 02-modelo-datos.md
│   ├── 03-decision-arquitectura.md
│   ├── 04-roadmap-mvp.md
│   ├── 05-estructura-bd-backend.md
│
├── rally-app
│   → frontend Angular
│
└── rally-back
    → backend Flask

Puedo modificar:

- frontend
- backend
- SQL
- configuración

cuando sea necesario para implementar una funcionalidad completa.

---

# 2. Documentación del proyecto

Debo consultar la documentación disponible en:

.gemini/

Archivos disponibles:

- 00-resumen-ejecutivo.md
- 01-reglas-negocio.md
- 02-modelo-datos.md
- 03-decision-arquitectura.md
- 04-roadmap-mvp.md
- 05-estructura-bd-backend.md

Estos documentos contienen:

- reglas del negocio
- modelo de datos
- arquitectura
- roadmap

No debo contradecir estas decisiones.

Si detecto inconsistencias debo **reportarlas antes de modificar el código**.

---

# 3. Filosofía de desarrollo

Debo seguir el principio:

Primero funcional, después perfecto.

Esto implica:

- priorizar simplicidad
- evitar sobreingeniería
- evitar frameworks innecesarios
- construir iterativamente

Debo favorecer soluciones:

- simples
- claras
- mantenibles

---

# 4. Flujo de trabajo obligatorio

Antes de modificar código debo seguir este flujo.

### 1. Leer contexto

Debo revisar:

- archivos relevantes del código
- documentación dentro de `.gemini/`

---

### 2. Analizar

Debo explicar:

- qué problema se resolverá
- qué archivos se modificarán
- por qué

---

### 3. Proponer plan

Antes de escribir código debo describir:

- cambios propuestos
- impacto en backend
- impacto en frontend
- impacto en base de datos

---

### 4. Implementar

Después de definir el plan debo:

- generar código consistente con el proyecto
- evitar cambios innecesarios

---

# 5. Reglas anti-alucinación

No debo inventar información.

Esto incluye:

- endpoints inexistentes
- tablas inexistentes
- columnas inexistentes
- dependencias no declaradas

Si algo no está claro debo:

pedir contexto adicional.

---

# 6. Cambios en base de datos

Cuando un cambio requiera modificar el modelo de datos debo:

1. verificar el modelo definido en:

05-estructura-bd-backend.md

2. explicar la modificación
3. justificar la razón

No debo crear tablas arbitrariamente.

---

# 7. Cambios end‑to‑end

Puedo implementar cambios que involucren:

- backend
- frontend
- base de datos

Por ejemplo:

funcionalidad → endpoint → modelo → interfaz UI.

Debo explicar cada capa modificada.

---

# 8. Estilo de código

Debo priorizar:

- claridad
- simplicidad
- legibilidad

Buenas prácticas:

- funciones pequeñas
- nombres descriptivos
- lógica clara

Debo evitar soluciones complejas si existe una solución simple.

---

# 9. Frontend Angular

Debo respetar las convenciones Angular.

Nombrado de archivos:

kebab-case

Prefijos recomendados:

menu → pantallas de menú  
list → pantallas de listado  
capture → formularios  
remove → eliminación

Ejemplos correctos:

list-consultants.component.ts  
capture-certification.component.ts

---

# 10. Dependencias

Debo evitar introducir nuevas dependencias externas.

Si una dependencia es necesaria debo:

1. explicar por qué es necesaria
2. justificar el beneficio
3. confirmar compatibilidad

---

# 11. Cambios grandes

Si el cambio es grande debo:

- dividir el trabajo en pasos
- implementar incrementalmente
- evitar modificaciones masivas en una sola iteración

---

# 12. Objetivo del agente

Mi objetivo es ayudar a construir el **MVP funcional del Rally de Certificaciones**.

Prioridades:

1. sistema funcional
2. reglas de negocio correctas
3. código mantenible

No debo optimizar prematuramente.

---

# 13. Regla final

Si no estoy seguro de algo debo:

preguntar antes de implementar.
