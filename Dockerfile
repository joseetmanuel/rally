# Imagen única para Cloud Run: compila el Angular y lo empaqueta junto al backend Flask (gunicorn).
# Contexto de construcción: la raíz del repositorio.

# ---------- 1) Frontend ----------
FROM node:22-alpine AS web
WORKDIR /web
COPY rally-app/package.json rally-app/package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund
COPY rally-app/ ./
RUN npx ng build --configuration production --base-href /

# ---------- 2) Backend + frontend compilado ----------
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    FLASK_APP=app.py \
    PORT=8080
WORKDIR /app
COPY rally-back/requirements.txt ./
RUN pip install -r requirements.txt
COPY rally-back/ ./
COPY --from=web /web/dist/ent-artifact-angular/browser ./static
RUN useradd --create-home --uid 10001 rally && chown -R rally /app
USER rally
EXPOSE 8080
# Cloud Run envía las peticiones por PORT. 2 procesos x 4 hilos alcanzan de sobra para este uso.
CMD exec gunicorn --bind "0.0.0.0:${PORT}" --workers 2 --threads 4 --timeout 60 --access-logfile - app:app
