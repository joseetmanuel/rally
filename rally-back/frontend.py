"""Servir el frontend compilado desde el mismo servicio que la API, y cabeceras de seguridad.

En Cloud Run hay un solo servicio: Flask atiende /api y /health y entrega el Angular ya compilado
(carpeta STATIC_DIR). Sin esa carpeta (desarrollo local) esta parte no hace nada y el frontend se sirve
con `ng serve`.
"""
import os

from flask import abort, request, send_from_directory
from werkzeug.security import safe_join

ONE_DAY = 24 * 60 * 60


def add_security_headers(response):
    """Cabeceras de seguridad básicas para todas las respuestas (API y frontend)."""
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Referrer-Policy', 'same-origin')
    response.headers.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    if request.headers.get('X-Forwarded-Proto') == 'https' or request.is_secure:
        response.headers.setdefault('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    if request.path.startswith('/api/'):
        # Las respuestas dependen de la sesión y deben ser siempre las más recientes
        response.headers['Cache-Control'] = 'no-store'
    return response


def register_frontend(app):
    app.after_request(add_security_headers)

    static_dir = app.config.get('STATIC_DIR')
    if not static_dir or not os.path.isfile(os.path.join(static_dir, 'index.html')):
        return

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def frontend(path):
        if path == 'api' or path.startswith(('api/', 'health')):
            abort(404)

        file_path = safe_join(static_dir, path) if path else None
        if file_path and os.path.isfile(file_path):
            return send_from_directory(static_dir, path, max_age=ONE_DAY)

        # Un archivo con extensión que no existe es un 404 de verdad (no devolver la página como si fuera un .js)
        if os.path.splitext(path)[1]:
            abort(404)

        # Rutas de Angular (/app/home, /auth/home...): siempre la misma página de arranque, sin caché
        response = send_from_directory(static_dir, 'index.html', max_age=0)
        response.headers['Cache-Control'] = 'no-cache'
        return response
