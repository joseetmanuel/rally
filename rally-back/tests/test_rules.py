import uuid
from datetime import date

import pytest

from tests.helpers import api_team_id

START = date(2026, 1, 1)
CUTOFF = date(2026, 12, 15)


@pytest.fixture
def calendar(app):
    """Permite cambiar el calendario del Rally dentro de una prueba y lo restaura al terminar."""
    original = (app.config['RALLY_START'], app.config['RALLY_CUTOFF'])

    def set_window(start=None, cutoff=None):
        if start:
            app.config['RALLY_START'] = start
        if cutoff:
            app.config['RALLY_CUTOFF'] = cutoff

    yield set_window
    app.config['RALLY_START'], app.config['RALLY_CUTOFF'] = original


def setup_people(client):
    u = uuid.uuid4().hex[:8]
    consultant = client.post('/api/consultants', json={
        'full_name': f'Fechas {u}', 'participant_type': 'INTERNO', 'team_id': api_team_id(client)}).get_json()['id']
    type_id = client.post('/api/certification-types', json={
        'code': f'TR{u}', 'points_base': 10, 'points_for_course': 5}).get_json()['id']
    cert = client.post('/api/certifications', json={
        'vendor': 'V', 'name': f'Cert {u}', 'certification_type_id': type_id}).get_json()['id']
    reason = client.post('/api/extra-point-reason-types', json={'code': f'M{u}', 'name': 'Motivo'}).get_json()['id']
    return consultant, cert, reason


def certify(client, consultant, cert, day):
    return client.post('/api/consultant-certifications', json={
        'consultant_id': consultant, 'certification_id': cert, 'obtained_at': day})


# ------------------------------------------------------------------ calendario público
def test_rules_endpoint_is_public_and_describes_the_calendar(public_client):
    response = public_client.get('/api/rules')
    assert response.status_code == 200
    body = response.get_json()
    assert body['start'] == '2026-01-01' and body['cutoff'] == '2026-12-15'
    assert body['closed'] == (date.today() > CUTOFF)
    assert body['max_registrable'] == min(date.today(), CUTOFF).isoformat()


# ------------------------------------------------------------------ certificaciones obtenidas
def test_certification_before_the_start_is_rejected(client):
    consultant, cert, _ = setup_people(client)
    response = certify(client, consultant, cert, '2025-12-31')
    assert response.status_code == 400
    assert 'rally start' in response.get_json()['error'] and '2026-01-01' in response.get_json()['error']


def test_the_first_day_of_the_rally_is_accepted(client):
    consultant, cert, _ = setup_people(client)
    assert certify(client, consultant, cert, '2026-01-01').status_code == 201


def test_certification_after_the_cutoff_is_rejected(client, calendar):
    calendar(cutoff=date(2026, 3, 1))
    consultant, cert, _ = setup_people(client)
    assert certify(client, consultant, cert, '2026-03-01').status_code == 201   # el día del corte sí cuenta
    other = setup_people(client)
    response = certify(client, other[0], other[1], '2026-03-02')
    assert response.status_code == 400
    assert 'cutoff' in response.get_json()['error'] and '2026-03-01' in response.get_json()['error']


def test_editing_a_certification_into_the_wrong_dates_is_rejected(client, calendar):
    consultant, cert, _ = setup_people(client)
    record = certify(client, consultant, cert, '2026-02-01').get_json()
    assert client.put(f"/api/consultant-certifications/{record['id']}", json={'obtained_at': '2025-06-01'}).status_code == 400
    calendar(cutoff=date(2026, 3, 1))
    assert client.put(f"/api/consultant-certifications/{record['id']}", json={'obtained_at': '2026-04-01'}).status_code == 400
    assert client.get(f"/api/consultant-certifications/{record['id']}").get_json()['obtained_at'] == '2026-02-01'
    assert client.put(f"/api/consultant-certifications/{record['id']}", json={'obtained_at': '2026-02-15'}).status_code == 200


# ------------------------------------------------------------------ cursos y puntos extra
def test_course_sessions_follow_the_same_calendar(client, calendar):
    calendar(cutoff=date(2026, 6, 30))
    consultant, cert, _ = setup_people(client)
    base = {'certification_id': cert, 'instructor_consultant_id': consultant}
    assert client.post('/api/course-sessions', json={**base, 'session_date': '2025-12-31'}).status_code == 400
    assert client.post('/api/course-sessions', json={**base, 'session_date': '2026-07-01'}).status_code == 400
    session = client.post('/api/course-sessions', json={**base, 'session_date': '2026-06-30'})
    assert session.status_code == 201
    assert client.put(f"/api/course-sessions/{session.get_json()['id']}", json={'session_date': '2026-07-02'}).status_code == 400


def test_extra_points_follow_the_same_calendar(client, calendar):
    calendar(cutoff=date(2026, 6, 30))
    consultant, _, reason = setup_people(client)
    base = {'consultant_id': consultant, 'extra_point_reason_type_id': reason, 'points': 5}
    assert client.post('/api/consultant-extra-points', json={**base, 'awarded_at': '2025-12-31'}).status_code == 400
    assert client.post('/api/consultant-extra-points', json={**base, 'awarded_at': '2026-07-01T10:00:00'}).status_code == 400
    point = client.post('/api/consultant-extra-points', json={**base, 'awarded_at': '2026-06-30T23:00:00'})
    assert point.status_code == 201
    assert client.put(f"/api/consultant-extra-points/{point.get_json()['id']}",
                      json={'awarded_at': '2026-08-01'}).status_code == 400


# ------------------------------------------------------------------ el cálculo respeta el calendario
def test_points_outside_the_calendar_do_not_count_in_the_ranking_or_the_statement(client, calendar):
    consultant, cert, reason = setup_people(client)
    other_cert = client.post('/api/certifications', json={
        'vendor': 'V', 'name': f'Otra {uuid.uuid4().hex[:6]}',
        'certification_type_id': client.get(f'/api/certifications/{cert}').get_json()['certification_type_id']}).get_json()['id']
    assert certify(client, consultant, cert, '2026-02-01').status_code == 201
    assert certify(client, consultant, other_cert, '2026-05-01').status_code == 201
    assert client.post('/api/consultant-extra-points', json={
        'consultant_id': consultant, 'extra_point_reason_type_id': reason, 'points': 7,
        'awarded_at': '2026-05-02'}).status_code == 201

    def row():
        return next(r for r in client.get('/api/ranking').get_json() if r['consultant_id'] == consultant)

    assert row()['total_points'] == 10 + 10 + 7 and row()['certifications'] == 2

    # El corte se adelanta: lo posterior deja de contar (aunque ya estuviera registrado)
    calendar(cutoff=date(2026, 3, 1))
    assert row()['total_points'] == 10 and row()['certifications'] == 1
    statement = client.get(f'/api/consultants/{consultant}/statement').get_json()
    assert [e['kind'] for e in statement['entries']] == ['certification']
    assert statement['total_points'] == 10

    # Lo mismo por el inicio: una certificación anterior al inicio no cuenta
    calendar(start=date(2026, 3, 1), cutoff=date(2026, 12, 15))
    assert row()['total_points'] == 10 + 7  # sólo la de mayo y el punto extra


def test_a_course_outside_the_calendar_gives_no_points_and_no_bonus(client, calendar):
    teacher, cert, _ = setup_people(client)
    student = client.post('/api/consultants', json={
        'full_name': f'Alumno {uuid.uuid4().hex[:6]}', 'participant_type': 'INTERNO',
        'team_id': api_team_id(client)}).get_json()['id']
    session = client.post('/api/course-sessions', json={
        'certification_id': cert, 'instructor_consultant_id': teacher, 'session_date': '2026-02-01'}).get_json()
    client.post('/api/course-attendances', json={'course_session_id': session['id'], 'consultant_id': student})
    assert certify(client, student, cert, '2026-04-01').status_code == 201

    rows = lambda: {r['consultant_id']: r for r in client.get('/api/ranking').get_json()}
    assert rows()[teacher]['courses_given'] == 1 and rows()[student]['courses_taken'] == 1

    calendar(start=date(2026, 3, 1))  # el curso (febrero) queda antes del inicio
    assert rows()[teacher]['courses_given'] == 0 and rows()[teacher]['total_points'] == 0
    assert rows()[student]['courses_taken'] == 0
    assert rows()[student]['breakdown']['student_bonus'] == 0
    assert rows()[student]['breakdown']['certifications'] == 10  # la certificación de abril sí cuenta


def test_rules_certifications_lists_the_catalog_by_type_for_the_public(public_client, client):
    import uuid
    code = 'RT' + uuid.uuid4().hex[:6]
    type_id = client.post('/api/certification-types', json={'code': code, 'points_base': 15}).get_json()['id']
    cert = client.post('/api/certifications', json={
        'vendor': 'Proveedor Prueba', 'name': 'Cert de prueba ' + code, 'certification_type_id': type_id}).get_json()

    response = public_client.get('/api/rules/certifications')
    assert response.status_code == 200
    body = response.get_json()
    for item in body:
        # sólo catálogo: nada de personas
        assert set(item) == {'id', 'vendor', 'name', 'type', 'points'}
    mine = next(item for item in body if item['id'] == cert['id'])
    assert mine == {'id': cert['id'], 'vendor': 'Proveedor Prueba', 'name': 'Cert de prueba ' + code,
                    'type': code, 'points': 15}
