from flask import Blueprint, current_app, g, jsonify, request

import auth
from auth import limiter

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Inicia la sesión de administrador. Devuelve un token Bearer con vigencia de 8 horas."""
    if not current_app.config.get('ADMIN_PASSWORD'):
        return jsonify({'error': 'admin login is not configured'}), 503

    key = auth.client_key()
    wait = limiter.retry_after(key)
    if wait:
        response = jsonify({'error': 'too many attempts', 'retry_after': wait})
        response.headers['Retry-After'] = str(wait)
        return response, 429

    data = request.get_json(silent=True) or {}
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password are required'}), 400

    if not auth.credentials_ok(username, password):
        limiter.failure(key)
        wait = limiter.retry_after(key)
        if wait:  # este intento agotó el límite
            response = jsonify({'error': 'too many attempts', 'retry_after': wait})
            response.headers['Retry-After'] = str(wait)
            return response, 429
        return jsonify({'error': 'invalid credentials'}), 401

    limiter.success(key)
    user = current_app.config['ADMIN_USER']
    token, expires_at = auth.issue_token(user)
    return jsonify({'token': token, 'user': user, 'role': 'admin', 'expires_at': expires_at}), 200


@auth_bp.route('/auth/session', methods=['GET'])
def session():
    """Dice si el token enviado sigue siendo una sesión de administrador válida."""
    if not g.is_admin:
        code = 'token_expired' if g.token_problem == 'expired' else 'auth_required'
        return jsonify({'authenticated': False, 'code': code}), 401
    data, _ = auth.read_token(auth.bearer_token())
    return jsonify({'authenticated': True, 'user': data['u'], 'role': data['r'], 'expires_at': data['expires_at']}), 200
