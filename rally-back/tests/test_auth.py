import uuid

import pytest

import auth
from tests.helpers import api_team_id

USER = 'AdminPrueba'
PASSWORD = 'clave-de-prueba-123'


def login(client, username=USER, password=PASSWORD, **kwargs):
    return client.post('/api/auth/login', json={'username': username, 'password': password}, **kwargs)


def bearer(token):
    return {'Authorization': f'Bearer {token}'}


# ------------------------------------------------------------------ login
def test_login_returns_a_working_token(public_client):
    response = login(public_client)
    assert response.status_code == 200
    body = response.get_json()
    assert body['user'] == USER and body['role'] == 'admin'
    assert body['token'] and body['expires_at']

    session = public_client.get('/api/auth/session', headers=bearer(body['token']))
    assert session.status_code == 200
    assert session.get_json()['authenticated'] is True and session.get_json()['user'] == USER


def test_username_is_case_insensitive_but_password_is_not(public_client):
    assert login(public_client, username=USER.upper()).status_code == 200
    assert login(public_client, password=PASSWORD.upper()).status_code == 401


def test_wrong_credentials_are_rejected_without_hints(public_client):
    wrong_user = login(public_client, username='otro')
    wrong_password = login(public_client, password='incorrecta')
    assert wrong_user.status_code == wrong_password.status_code == 401
    assert wrong_user.get_json() == wrong_password.get_json() == {'error': 'invalid credentials'}


def test_login_requires_both_fields(public_client):
    assert public_client.post('/api/auth/login', json={'username': USER}).status_code == 400
    assert public_client.post('/api/auth/login', json={}).status_code == 400
    assert public_client.post('/api/auth/login', data='no es json').status_code == 400


def test_login_is_disabled_when_no_password_is_configured(app, public_client):
    original = app.config['ADMIN_PASSWORD']
    app.config['ADMIN_PASSWORD'] = None
    try:
        assert login(public_client).status_code == 503
    finally:
        app.config['ADMIN_PASSWORD'] = original


def test_session_endpoint_without_token_is_401(public_client):
    response = public_client.get('/api/auth/session')
    assert response.status_code == 401 and response.get_json()['authenticated'] is False


# ------------------------------------------------------------------ límite de intentos
def test_five_failures_lock_the_login_even_for_the_right_password(public_client):
    for _ in range(4):
        assert login(public_client, password='mal').status_code == 401
    fifth = login(public_client, password='mal')
    assert fifth.status_code == 429 and fifth.headers['Retry-After']
    assert fifth.get_json()['retry_after'] > 0
    assert login(public_client).status_code == 429  # ni con la contraseña correcta


def test_the_lock_expires(public_client, monkeypatch):
    now = [1000.0]
    monkeypatch.setattr(auth.limiter, 'clock', lambda: now[0])
    for _ in range(5):
        login(public_client, password='mal')
    assert login(public_client).status_code == 429
    now[0] += 61
    assert login(public_client).status_code == 200


def test_a_success_resets_the_failure_count(public_client):
    for _ in range(4):
        login(public_client, password='mal')
    assert login(public_client).status_code == 200
    for _ in range(4):
        assert login(public_client, password='mal').status_code == 401  # vuelve a tener 4 intentos


def test_each_ip_has_its_own_counter(public_client):
    for _ in range(5):
        login(public_client, password='mal', headers={'X-Forwarded-For': '10.0.0.1'})
    assert login(public_client, headers={'X-Forwarded-For': '10.0.0.1'}).status_code == 429
    assert login(public_client, headers={'X-Forwarded-For': '10.0.0.2'}).status_code == 200


# ------------------------------------------------------------------ escritura sólo para el administrador
WRITES = [
    ('post', '/api/teams', {'name': 'Nuevo'}),
    ('put', '/api/teams/1', {'name': 'Cambio'}),
    ('delete', '/api/teams/1', None),
    ('post', '/api/consultants', {'full_name': 'X', 'participant_type': 'INTERNO', 'team_id': 1}),
    ('post', '/api/certifications', {'vendor': 'V', 'name': 'N', 'certification_type_id': 1}),
    ('post', '/api/course-sessions', {}),
    ('post', '/api/consultant-extra-points', {}),
]


@pytest.mark.parametrize('method,path,body', WRITES)
def test_public_cannot_write(public_client, method, path, body):
    response = getattr(public_client, method)(path, json=body) if body is not None else getattr(public_client, method)(path)
    assert response.status_code == 401
    assert response.get_json()['code'] == 'auth_required'


def test_a_forged_or_garbage_token_cannot_write(public_client):
    for token in ('abc', 'x.y.z', ''):
        response = public_client.post('/api/teams', json={'name': 'Hack'}, headers=bearer(token))
        assert response.status_code == 401


def test_a_tampered_token_is_rejected(public_client):
    token = login(public_client).get_json()['token']
    tampered = token[:-2] + ('AA' if not token.endswith('AA') else 'BB')
    assert public_client.post('/api/teams', json={'name': 'Hack'}, headers=bearer(tampered)).status_code == 401


def test_an_expired_token_says_so(public_client, monkeypatch):
    token = login(public_client).get_json()['token']
    monkeypatch.setattr(auth, 'TOKEN_MAX_AGE', -1)
    response = public_client.post('/api/teams', json={'name': 'Tarde'}, headers=bearer(token))
    assert response.status_code == 401 and response.get_json()['code'] == 'token_expired'
    session = public_client.get('/api/auth/session', headers=bearer(token))
    assert session.status_code == 401 and session.get_json()['code'] == 'token_expired'


def test_admin_can_write_and_nothing_was_created_for_the_public(public_client, client):
    name = f'Equipo {uuid.uuid4().hex[:6]}'
    assert public_client.post('/api/teams', json={'name': name}).status_code == 401
    assert name not in [t['name'] for t in client.get('/api/teams').get_json()]
    assert client.post('/api/teams', json={'name': name}).status_code == 201


def test_a_login_token_from_the_login_endpoint_can_write(public_client):
    token = login(public_client).get_json()['token']
    name = f'Equipo {uuid.uuid4().hex[:6]}'
    assert public_client.post('/api/teams', json={'name': name}, headers=bearer(token)).status_code == 201


def test_public_can_read_everything(public_client):
    for path in ('/api/teams', '/api/consulting-firms', '/api/consultants', '/api/certifications',
                 '/api/certification-types', '/api/course-sessions', '/api/course-attendances',
                 '/api/consultant-certifications', '/api/consultant-extra-points', '/api/extra-point-reason-types',
                 '/api/ranking', '/api/ranking?detail=1'):
        assert public_client.get(path).status_code == 200, path


def test_an_invalid_token_on_a_read_is_just_the_public_view(public_client):
    assert public_client.get('/api/teams', headers=bearer('basura')).status_code == 200


def test_preflight_requests_do_not_need_a_session(public_client):
    response = public_client.options('/api/teams', headers={
        'Origin': 'http://localhost:4200', 'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type'})
    assert response.status_code == 200
    assert 'authorization' in response.headers['Access-Control-Allow-Headers'].lower()


# ------------------------------------------------------------------ vista pública: sin correos ni reembolsos
def make_consultant_with_certification(client):
    u = uuid.uuid4().hex[:8]
    consultant = client.post('/api/consultants', json={
        'full_name': f'Privado {u}', 'participant_type': 'INTERNO', 'team_id': api_team_id(client),
        'email': f'privado{u}@ejemplo.com', 'teams_contact': f'privado.{u}'}).get_json()
    type_id = client.post('/api/certification-types', json={'code': f'TP{u}', 'points_base': 10}).get_json()['id']
    cert_id = client.post('/api/certifications', json={
        'vendor': 'V', 'name': f'Cert {u}', 'certification_type_id': type_id}).get_json()['id']
    record = client.post('/api/consultant-certifications', json={
        'consultant_id': consultant['id'], 'certification_id': cert_id, 'obtained_at': '2026-02-01',
        'reimbursement_amount': 1234.5, 'paid_with_own_resources': True, 'reimbursement_registered': True,
        'notes': 'pagó con tarjeta personal'}).get_json()
    return consultant, record


def test_public_does_not_receive_emails_or_contact(public_client, client):
    consultant, _ = make_consultant_with_certification(client)

    listing = {c['id']: c for c in public_client.get('/api/consultants').get_json()}[consultant['id']]
    detail = public_client.get(f"/api/consultants/{consultant['id']}").get_json()
    for view in (listing, detail):
        assert 'email' not in view and 'teams_contact' not in view
        assert view['full_name'] == consultant['full_name']  # el resto sí viaja

    admin_view = client.get(f"/api/consultants/{consultant['id']}").get_json()
    assert admin_view['email'] == consultant['email'] and admin_view['teams_contact'] == consultant['teams_contact']


def test_public_does_not_receive_reimbursement_data(public_client, client):
    consultant, record = make_consultant_with_certification(client)
    hidden = {'reimbursement_amount', 'paid_with_own_resources', 'reimbursement_registered',
              'reimbursement_registered_at', 'notes'}

    public_rows = [r for r in public_client.get('/api/consultant-certifications').get_json() if r['id'] == record['id']]
    public_one = public_client.get(f"/api/consultant-certifications/{record['id']}").get_json()
    for row in public_rows + [public_one]:
        assert not hidden & set(row)
        assert row['obtained_at'] == '2026-02-01'  # lo demás sí

    admin_row = client.get(f"/api/consultant-certifications/{record['id']}").get_json()
    assert admin_row['reimbursement_amount'] == 1234.5 and admin_row['paid_with_own_resources'] is True
    assert admin_row['notes'] == 'pagó con tarjeta personal'


def test_notes_of_other_records_stay_visible_to_the_public(public_client, client):
    team_id = api_team_id(client)
    consultant_id = client.post('/api/consultants', json={
        'full_name': f'Nota {uuid.uuid4().hex[:6]}', 'participant_type': 'INTERNO', 'team_id': team_id}).get_json()['id']
    reason_id = client.post('/api/extra-point-reason-types', json={
        'code': f'R{uuid.uuid4().hex[:6]}', 'name': 'Motivo'}).get_json()['id']
    extra = client.post('/api/consultant-extra-points', json={
        'consultant_id': consultant_id, 'extra_point_reason_type_id': reason_id, 'points': 5,
        'awarded_at': '2026-03-01', 'notes': 'Apoyo en el rally'}).get_json()
    public_extra = public_client.get(f"/api/consultant-extra-points/{extra['id']}").get_json()
    assert public_extra['notes'] == 'Apoyo en el rally'


def test_ranking_and_statement_never_expose_private_data(public_client, client):
    consultant, _ = make_consultant_with_certification(client)
    for path in ('/api/ranking?detail=1', f"/api/consultants/{consultant['id']}/statement"):
        text = public_client.get(path).get_data(as_text=True)
        assert consultant['email'] not in text and 'reimbursement' not in text


def test_responses_vary_by_authorization(public_client):
    assert 'Authorization' in public_client.get('/api/teams').headers['Vary']
