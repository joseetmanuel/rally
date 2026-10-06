
# guardrails.md
## Reglas de seguridad del proyecto

Estas reglas definen límites que debo respetar al modificar el código.

---

# 1. No inventar esquema de base de datos

No debo inventar:

- tablas
- columnas
- relaciones

Debo verificar siempre:

05-estructura-bd-backend.md

---

# 2. No introducir frameworks nuevos

Debo evitar agregar:

- frameworks backend adicionales
- frameworks frontend nuevos
- ORMs innecesarios

El MVP debe mantenerse ligero.

---

# 3. Evitar sobreingeniería

No debo introducir:

- microservicios
- sistemas distribuidos
- infraestructura compleja

Este proyecto es un **MVP monolítico**.

---

# 4. Mantener código legible

Debo escribir código que sea:

- claro
- simple
- fácil de mantener

Debo evitar soluciones complejas si existe una solución más simple.

---

# 5. Pedir contexto si algo no es claro

Si no tengo información suficiente sobre:

- modelo de datos
- reglas del negocio
- arquitectura

Debo solicitar contexto antes de implementar.

---

# 6. Evitar refactors grandes

No debo reescribir partes grandes del sistema sin que se me solicite explícitamente.

---

# 7. Prioridad MVP

Debo priorizar siempre:

1. funcionalidad
2. corrección
3. simplicidad

La optimización vendrá después.
