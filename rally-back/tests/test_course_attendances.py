import pytest
import uuid
from models.consultant import Consultant
from models.certification_type import CertificationType
from models.certification import Certification
from models.course_session import CourseSession
from database import db

def setup_data(app):
    with app.app_context():
        unique_suffix = str(uuid.uuid4())[:8]
        inst = Consultant(full_name=f"Instructor {unique_suffix}", participant_type="INTERNO", team_number=1, email=f"inst{unique_suffix}@test.com")
        assistant = Consultant(full_name=f"Assistant {unique_suffix}", participant_type="INTERNO", team_number=2, email=f"ast{unique_suffix}@test.com")
        ct = CertificationType(code=f"TypeAtt{unique_suffix}", points_base=50)
        db.session.add_all([inst, assistant, ct])
        db.session.commit()
        
        cert = Certification(name=f"Cert Att {unique_suffix}", vendor="Vendor", certification_type_id=ct.id)
        db.session.add(cert)
        db.session.commit()

        session = CourseSession(
            certification_id=cert.id,
            instructor_consultant_id=inst.id,
            session_date="2026-10-06"
        )
        db.session.add(session)
        db.session.commit()
        
        return session.id, inst.id, assistant.id

def test_create_course_attendance(client, app):
    session_id, inst_id, assistant_id = setup_data(app)
    resp = client.post('/api/course-attendances', json={
        "course_session_id": session_id,
        "consultant_id": assistant_id,
        "points_obtained": 10
    })
    assert resp.status_code == 201
    assert resp.json['consultant_id'] == assistant_id

def test_create_attendance_instructor_fail(client, app):
    session_id, inst_id, assistant_id = setup_data(app)
    resp = client.post('/api/course-attendances', json={
        "course_session_id": session_id,
        "consultant_id": inst_id,
        "points_obtained": 10
    })
    assert resp.status_code == 400
    assert "cannot be the instructor" in resp.json['error']

def test_get_course_attendances(client, app):
    session_id, inst_id, assistant_id = setup_data(app)
    client.post('/api/course-attendances', json={
        "course_session_id": session_id,
        "consultant_id": assistant_id
    })
    resp = client.get('/api/course-attendances')
    assert resp.status_code == 200
    assert len(resp.json) > 0

def test_delete_course_attendance(client, app):
    session_id, inst_id, assistant_id = setup_data(app)
    create_resp = client.post('/api/course-attendances', json={
        "course_session_id": session_id,
        "consultant_id": assistant_id
    })
    att_id = create_resp.json['id']

    del_resp = client.delete(f'/api/course-attendances/{att_id}')
    assert del_resp.status_code == 204

    get_resp = client.get(f'/api/course-attendances/{att_id}')
    assert get_resp.status_code == 404
