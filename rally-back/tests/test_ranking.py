import uuid
from datetime import date, datetime

from database import db
from models.certification import Certification
from models.certification_type import CertificationType
from models.consultant import Consultant
from models.consultant_certification import ConsultantCertification
from models.consultant_extra_point import ConsultantExtraPoint
from models.course_attendance import CourseAttendance
from models.course_session import CourseSession
from models.extra_point_reason_type import ExtraPointReasonType


def build_scenario(app):
    """Crea un escenario aislado (nombres/códigos únicos) y devuelve los ids relevantes."""
    with app.app_context():
        u = uuid.uuid4().hex[:8]

        def consultant(label, n):
            c = Consultant(full_name=f"{label} {u}", participant_type="INTERNO",
                           team_number=1, email=f"{label.lower()}{n}{u}@test.com")
            db.session.add(c)
            return c

        i, j, a, b, c, e = (consultant(l, k) for k, l in enumerate(["I", "J", "A", "B", "C", "E"]))
        # base 30, curso 15, bono expositor 3, bono alumno 6
        big = CertificationType(code=f"BIG{u}", points_base=30, points_for_course=15,
                                points_for_instructor=3, points_for_student=6)
        # base 15 (dos de estas suman 30 puntos, para forzar un empate con una de `big`)
        small = CertificationType(code=f"SMALL{u}", points_base=15, points_for_course=5,
                                  points_for_instructor=1, points_for_student=2)
        reason = ExtraPointReasonType(code=f"R{u}", name="Motivo prueba")
        db.session.add_all([big, small, reason])
        db.session.flush()

        cert = Certification(vendor="V", name=f"Big {u}", certification_type_id=big.id)
        s1 = Certification(vendor="V", name=f"Small1 {u}", certification_type_id=small.id)
        s2 = Certification(vendor="V", name=f"Small2 {u}", certification_type_id=small.id)
        db.session.add_all([cert, s1, s2])
        db.session.flush()

        # Dos expositores distintos imparten la misma certificación
        sess_i = CourseSession(certification_id=cert.id, instructor_consultant_id=i.id, session_date=date(2026, 1, 10))
        sess_j = CourseSession(certification_id=cert.id, instructor_consultant_id=j.id, session_date=date(2026, 1, 20))
        db.session.add_all([sess_i, sess_j])
        db.session.flush()

        # A y B toman cursos; C también pero nunca se certifica
        for session in (sess_i, sess_j):
            db.session.add(CourseAttendance(course_session_id=session.id, consultant_id=a.id))
        db.session.add(CourseAttendance(course_session_id=sess_i.id, consultant_id=b.id))
        db.session.add(CourseAttendance(course_session_id=sess_i.id, consultant_id=c.id))

        # A se certifica DESPUÉS de los cursos; B se había certificado ANTES (sin bonos)
        db.session.add(ConsultantCertification(consultant_id=a.id, certification_id=cert.id, obtained_at=date(2026, 2, 1)))
        db.session.add(ConsultantCertification(consultant_id=b.id, certification_id=cert.id, obtained_at=date(2026, 1, 1)))
        # E: dos certificaciones pequeñas = 30 puntos (empata con B, que tiene 1 certificación)
        db.session.add(ConsultantCertification(consultant_id=e.id, certification_id=s1.id, obtained_at=date(2026, 3, 1)))
        db.session.add(ConsultantCertification(consultant_id=e.id, certification_id=s2.id, obtained_at=date(2026, 3, 2)))

        db.session.add(ConsultantExtraPoint(consultant_id=a.id, extra_point_reason_type_id=reason.id,
                                            points=5, awarded_at=datetime(2026, 4, 1)))
        db.session.commit()
        return {k: v.id for k, v in dict(i=i, j=j, a=a, b=b, c=c, e=e).items()}


def get_rows(client, ids):
    resp = client.get('/api/ranking')
    assert resp.status_code == 200
    by_id = {r['consultant_id']: r for r in resp.json}
    return resp.json, {k: by_id[v] for k, v in ids.items()}


def test_ranking_points_breakdown(client, app):
    ids = build_scenario(app)
    _, rows = get_rows(client, ids)

    # A: cert 30 + bono alumno 6 (una sola vez aunque tomó 2 cursos) + extra 5
    assert rows['a']['total_points'] == 41
    assert rows['a']['breakdown'] == {'certifications': 30, 'courses_given': 0,
                                      'student_bonus': 6, 'instructor_bonus': 0, 'extra': 5}
    assert rows['a']['courses_taken'] == 2 and rows['a']['certifications'] == 1
    # B se certificó antes del curso: sólo puntos base, sin bonos
    assert rows['b']['total_points'] == 30
    assert rows['b']['breakdown']['student_bonus'] == 0
    # Ambos expositores cobran el bono por el alumno A, más 15 por impartir
    assert rows['i']['total_points'] == 18 and rows['j']['total_points'] == 18
    assert rows['i']['courses_given'] == 1
    # C asistió pero no se certificó: 0 puntos
    assert rows['c']['total_points'] == 0 and rows['c']['courses_taken'] == 1


def test_ranking_order_and_tiebreak(client, app):
    ids = build_scenario(app)
    full, rows = get_rows(client, ids)

    # E y B empatan en 30 puntos: gana E por tener más certificaciones
    assert rows['e']['total_points'] == rows['b']['total_points'] == 30
    assert rows['e']['position'] < rows['b']['position']
    assert rows['a']['position'] < rows['e']['position'] < rows['b']['position'] \
        < rows['i']['position'] < rows['c']['position']
    # posiciones consecutivas desde 1 y orden descendente por puntos
    assert [r['position'] for r in full] == list(range(1, len(full) + 1))
    points = [r['total_points'] for r in full]
    assert points == sorted(points, reverse=True)


def test_ranking_row_shape(client, app):
    ids = build_scenario(app)
    _, rows = get_rows(client, ids)
    expected = {'position', 'consultant_id', 'full_name', 'certifications', 'courses_given',
                'courses_taken', 'total_points', 'last_certification_date', 'breakdown'}
    assert expected <= set(rows['a'])
    assert rows['a']['last_certification_date'] == '2026-02-01'
    assert rows['c']['last_certification_date'] is None


def test_ranking_without_activity_has_zero_points(client, app):
    with app.app_context():
        u = uuid.uuid4().hex[:8]
        c = Consultant(full_name=f"Idle {u}", participant_type="INTERNO", team_number=1, email=f"idle{u}@test.com")
        db.session.add(c)
        db.session.commit()
        cid = c.id
    rows = {r['consultant_id']: r for r in client.get('/api/ranking').json}
    assert rows[cid]['total_points'] == 0
    assert rows[cid]['certifications'] == 0
