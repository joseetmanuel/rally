# Rally de Certificaciones – Reglas de Negocio

## Propósito

Definir las reglas que gobiernan el funcionamiento del sistema de **ranking de consultores basado en certificaciones, cursos y contribuciones**.

Estas reglas permiten garantizar consistencia en el cálculo de puntos y en la generación del ranking.

---

# Entidades principales

El sistema se basa en las siguientes entidades conceptuales:

- **Consultor**
- **Certificación**
- **Tipo de Certificación**
- **Curso**
- **Asistencia a Curso**
- **Puntos Extra**
- **Ranking**

Cada entidad contribuye al cálculo del puntaje total de un consultor.

---

# Regla 1 — Puntos por certificación

Cada certificación tiene un valor de puntos definido por su **tipo de certificación**.

De acuerdo a la siguiente tabla:

| Tipo de certificación | Puntos |
|----------------------|-------|
| Fundacional | 10 |
| Professional | 30 |
| Extperto | 60 |
| Opcional | 70 |

Cuando un consultor registra una certificación válida:
  puntos_consultor += puntos_tipo_certificacion
  

### Restricciones

- Una certificación **solo puede registrarse una vez por consultor**.

---

# Regla 2 — Registro de certificaciones

Para registrar una certificación se debe almacenar:

- consultor
- certificación
- fecha de obtención
- evidencia (opcional)
- puntos asociados

El sistema **no calcula puntos dinámicamente por nombre de certificación**, sino por su **tipo**.

---

# Regla 3 — Impartición de cursos

Un consultor que ya se haya certificado, puede dar un curso de esa certificación y se convierte en Expositor.

Solo por impartir el curso, el expositor obitienen puntos de acuerdo con el tipo de certificación impartida en el curso:

| Tipo de certificación | Puntos |
|----------------------|-------|
| Fundacional | 5 |
| Professional | 15 |
| Extperto | 30 |
| Opcional | 35 |

Cuando un Expositor da un curso:
 puntos_consultor += puntos_tipo_certificacion_curso
 
---

# Regla 4 — Asistencia de cursos

Uno consultor puede obtener puntos por asistir a un curso, siempre y cuando se certifique por haber tomado el curso, entonces tanto el consultor como el Expositor obtienen puntos de acuerdo a la siguiente tabla:

| Tipo de certificación | Puntos Consultor | Puntos Expositor |
|----------------------|-------|-------|
| Fundacional | 2 | 1 |
| Professional | 6 | 3 |
| Extperto | 12 | 6 |
| Opcional | 14 | 7 |


### Restricciones

- Un consultor **solo puede registrar una asistencia por curso**.
- Un Expositor puede recibir tantos puntos como asistentes a sus curso tenga registrados
- Un consultor puede registrar asistencia al mismo curso impartido por diferentes expositores, en ese caso TODOS los expositores reciben puntos pero el consultor solo recibe una vez puntos.
- Un curso debe existir previamente en el sistema.
- Un Expositor no puede estar registrado como asistente a su propio curso.

Cuando un Expositor da un curso y un consultor se certifica:
 puntos_consultor += puntos_tipo_consultor y
 puntos_consultor_expositor += puntos_tipo_consultor_expositor

---

# Regla 5 — Puntos adicionales

El sistema permite otorgar puntos adicionales por contribuciones especiales.

Ejemplos:

- contribuir con material técnico
- mentoría

Cada registro de puntos adicionales incluye:

- consultor
- motivo
- cantidad de puntos
- fecha
- comentario opcional

puntos_consultor += puntos_extra


---

# Regla 6 — Cálculo del puntaje total

El puntaje total de un consultor se calcula como:

puntaje_total = puntos_certificaciones + puntos_cursos + puntos_extra

El sistema debe calcularlo **dinámicamente**

La implementación técnica se definirá en la arquitectura.

---

# Regla 7 — Generación del ranking

El ranking se genera ordenando los consultores por:
puntaje_total DESC


En caso de empate:

1. mayor número de certificaciones
2. fecha más reciente de certificación

---

# Regla 8 — Visualización del ranking

El ranking debe mostrar al menos:

- posición
- nombre del consultor
- total de puntos
- número de certificaciones
- número de cursos dados
- número de cursos tomados

Ejemplo:

| Posición | Consultor | Certificaciones | Cursos Dados | Cursos Tomados | Puntos |
|--------|-----------|----------------|-------|-------|-------|
| 1 | Ana | 4 | 0 | 2 | 78 | 
| 2 | Luis | 3 | 1 | 0 | 70 |
| 3 | Carlos | 2 | 0 | 1 | 45 |

---

# Regla 9 — Eliminación de registros

Si se elimina:

- una certificación
- una asistencia a curso
- un punto extra

entonces el puntaje total del consultor debe recalcularse.

---

# Regla 10 — Integridad de datos

El sistema debe asegurar:

- un consultor no puede duplicar certificaciones
- un consultor no puede duplicar asistencia a un mismo curso
- los puntos de certificación dependen de su tipo
- los puntos extra deben registrar motivo

---

# Regla 11 — Evolución futura

El modelo permite agregar en fases posteriores:

- multiplicadores por año
- caducidad de certificaciones
- ranking por especialidad
- ranking por equipo
- badges o logros

