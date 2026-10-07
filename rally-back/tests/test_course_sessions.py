import pytest
import uuid
from models.consultant import Consultant
from models.certification_type import CertificationType
from models.certification import Certification
from models.course_session import CourseSession
from database import db
from tests.helpers import default_team_id

def setup_data(app):
    with app.app_context():
        unique_suffix = str(uuid.uuid4())[:8]
        c = Consultant(full_name=f"Instructor {unique_suffix}", participant_type="INTERNO", team_id=default_team_id(), email=f"inst{unique_suffix}@test.com")
        ct = CertificationType(code=f"TypeSession{unique_suffix}", points_base=50)
        db.session.add_all([c, ct])
        db.session.commit()
        
        cert = Certification(name=f"Cert Session {unique_suffix}", vendor="Vendor", certification_type_id=ct.id)
        db.session.add(cert)
        db.session.commit()
        return c.id, cert.id

def test_create_course_session(client, app):
    inst_id, cert_id = setup_data(app)
    resp = client.post('/api/course-sessions', json={
        "certification_id": cert_id,
        "instructor_consultant_id": inst_id,
        "session_date": "2026-10-06",
        "title": "Bootcamp AWS",
        "notes": "Intro"
    })
    assert resp.status_code == 201
    assert resp.json['title'] == "Bootcamp AWS"

def test_get_course_sessions(client, app):
    inst_id, cert_id = setup_data(app)
    client.post('/api/course-sessions', json={
        "certification_id": cert_id,
        "instructor_consultant_id": inst_id,
        "session_date": "2026-10-06"
    })
    resp = client.get('/api/course-sessions')
    assert resp.status_code == 200
    assert len(resp.json) > 0

def test_update_course_session(client, app):
    inst_id, cert_id = setup_data(app)
    create_resp = client.post('/api/course-sessions', json={
        "certification_id": cert_id,
        "instructor_consultant_id": inst_id,
        "session_date": "2026-10-06",
        "title": "Old Title"
    })
    session_id = create_resp.json['id']

    update_resp = client.put(f'/api/course-sessions/{session_id}', json={
        "title": "New Title"
    })
    assert update_resp.status_code == 200
    assert update_resp.json['title'] == "New Title"

def test_delete_course_session(client, app):
    inst_id, cert_id = setup_data(app)
    create_resp = client.post('/api/course-sessions', json={
        "certification_id": cert_id,
        "instructor_consultant_id": inst_id,
        "session_date": "2026-10-06"
    })
    session_id = create_resp.json['id']

    del_resp = client.delete(f'/api/course-sessions/{session_id}')
    assert del_resp.status_code == 204

    get_resp = client.get(f'/api/course-sessions/{session_id}')
    assert get_resp.status_code == 404
