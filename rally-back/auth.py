"""Perfil administrador: sesión por token firmado, login con límite de intentos y vista pública.

- Perfil público: sin sesión. Lee todo (GET) pero no recibe correos ni datos de reembolsos y no puede modificar.
- Perfil administrador: sesión por token (Bearer) firmado con SECRET_KEY y con vigencia limitada.

Las credenciales NO viven en el código ni en la base: salen de ADMIN_USER / ADMIN_PASSWORD (variables de
entorno; en Cloud Run se inyectan desde Secret Manager) y el token se firma con SECRET_KEY.
"""
import hmac
import json
import re
import threading
import time
from datetime import datetime, timedelta, timezone

from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

TOKEN_MAX_AGE = 8 * 60 * 60  # 8 horas
SALT = 'rally-admin-session'
WRITE_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}
LOGIN_PATH = '/api/auth/login'

# Pantallas sólo para el administrador: Consultores y todos los catálogos. Su lectura (GET) exige sesión de
# administrador. NO incluye /api/consultants/<id>/statement, que es el estado de cuenta público.
ADMIN_ONLY_READ = re.compile(
    r'^/api/(consultants|teams|consulting-firms|certification-types|certifications|'
    r'consultant-certifications|extra-point-reason-types|ctos|directions|subdirections|managements)(/\d+)?/?$|'
    r'^/api/org-structure/?$')

# Datos que el perfil público no debe recibir (correos, contacto y todo lo de reembolsos)
SENSITIVE_KEYS = {
    'email', 'teams_contact',
    'reimbursement_amount', 'paid_with_own_resources', 'reimbursement_registered', 'reimbursement_registered_at',
}
# Rutas donde además se oculta `notes` (las observaciones de una certificación pueden hablar de reembolsos)
NOTES_HIDDEN_PREFIXES = ('/api/consultant-certifications',)


# ------------------------------------------------------------------ tokens
def _serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt=SALT)


def issue_token(user):
    """Devuelve (token, expires_at ISO en UTC)."""
    token = _serializer().dumps({'u': user, 'r': 'admin'})
    expires = datetime.now(timezone.utc) + timedelta(seconds=TOKEN_MAX_AGE)
    return token, expires.isoformat()


def read_token(token):
    """Devuelve (datos, motivo). Motivo: None si es válido, 'expired' o 'invalid'."""
    try:
        data, issued = _serializer().loads(token, max_age=TOKEN_MAX_AGE, return_timestamp=True)
    except SignatureExpired:
        return None, 'expired'
    except BadSignature:
        return None, 'invalid'
    expires = issued + timedelta(seconds=TOKEN_MAX_AGE)
    return {**data, 'expires_at': expires.astimezone(timezone.utc).isoformat()}, None


def bearer_token():
    header = request.headers.get('Authorization', '')
    return header[7:].strip() if header[:7].lower() == 'bearer ' else None


# ------------------------------------------------------------------ credenciales
def credentials_ok(username, password):
    """Comparación en tiempo constante. El usuario no distingue mayúsculas; la contraseña sí."""
    expected_user = (current_app.config.get('ADMIN_USER') or '').strip().lower()
    expected_password = current_app.config.get('ADMIN_PASSWORD') or ''
    user_ok = hmac.compare_digest((username or '').strip().lower().encode(), expected_user.encode())
    password_ok = hmac.compare_digest((password or '').encode(), expected_password.encode())
    return user_ok and password_ok


# ------------------------------------------------------------------ límite de intentos
class LoginLimiter:
    """Bloquea una IP durante `lock_seconds` tras `max_failures` intentos fallidos seguidos (en memoria)."""

    def __init__(self, max_failures=5, lock_seconds=60, clock=time.monotonic):
        self.max_failures = max_failures
        self.lock_seconds = lock_seconds
        self.clock = clock
        self._state = {}  # clave -> [fallos, bloqueado_hasta]
        self._lock = threading.Lock()

    def retry_after(self, key):
        """Segundos que faltan para poder reintentar (0 si no está bloqueada)."""
        with self._lock:
            _, locked_until = self._state.get(key, (0, 0))
            remaining = locked_until - self.clock()
            return int(remaining) + 1 if remaining > 0 else 0

    def failure(self, key):
        with self._lock:
            failures, locked_until = self._state.get(key, (0, 0))
            if locked_until and locked_until <= self.clock():
                failures, locked_until = 0, 0  # el bloqueo ya venció: se empieza de cero
            failures += 1
            if failures >= self.max_failures:
                locked_until = self.clock() + self.lock_seconds
                failures = 0
            self._state[key] = (failures, locked_until)

    def success(self, key):
        with self._lock:
            self._state.pop(key, None)

    def reset(self):
        with self._lock:
            self._state.clear()


limiter = LoginLimiter()


def client_key():
    """IP del cliente (detrás de Cloud Run viene en X-Forwarded-For)."""
    forwarded = request.headers.get('X-Forwarded-For', '')
    return forwarded.split(',')[0].strip() if forwarded else (request.remote_addr or 'unknown')


# ------------------------------------------------------------------ guardias de Flask
def authenticate_request():
    """before_request: marca g.is_admin y exige sesión de administrador para escribir."""
    g.is_admin = False
    g.token_problem = None
    if not request.path.startswith('/api/'):
        return None

    token = bearer_token()
    if token:
        data, problem = read_token(token)
        if data:
            g.is_admin = True
            g.admin_user = data['u']
        else:
            g.token_problem = problem

    needs_admin = (request.method in WRITE_METHODS and request.path != LOGIN_PATH) or (
        request.method == 'GET' and ADMIN_ONLY_READ.match(request.path))
    if needs_admin and not g.is_admin:
        if g.token_problem == 'expired':
            return jsonify({'error': 'session expired', 'code': 'token_expired'}), 401
        return jsonify({'error': 'authentication required', 'code': 'auth_required'}), 401
    return None


def _strip(value, hide_notes):
    if isinstance(value, dict):
        return {k: _strip(v, hide_notes) for k, v in value.items()
                if k not in SENSITIVE_KEYS and not (hide_notes and k == 'notes')}
    if isinstance(value, list):
        return [_strip(v, hide_notes) for v in value]
    return value


def public_view(response):
    """after_request: el perfil público recibe las respuestas sin correos, contacto ni reembolsos."""
    if not request.path.startswith('/api/'):
        return response
    response.headers['Vary'] = 'Authorization'
    if getattr(g, 'is_admin', False) or not response.is_json or response.status_code >= 400:
        return response
    hide_notes = request.path.startswith(NOTES_HIDDEN_PREFIXES)
    data = _strip(response.get_json(), hide_notes)
    response.set_data(json.dumps(data, ensure_ascii=False))
    return response
