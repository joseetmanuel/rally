from models.consultant import Consultant
from models.consultant_certification import ConsultantCertification
from models.consultant_extra_point import ConsultantExtraPoint
from models.course_attendance import CourseAttendance
from models.course_session import CourseSession


class RankingService:
    """Calcula el ranking dinámicamente (Regla 6) a partir de los registros base.

    puntaje_total = certificaciones + cursos impartidos + bono alumno
                    + bono expositor + puntos extra
    """

    @staticmethod
    def calculate_ranking():
        consultants = Consultant.query.all()
        stats = {
            c.id: {
                'consultant_id': c.id,
                'full_name': c.full_name,
                'certifications': 0,
                'courses_given': 0,
                'courses_taken': 0,
                'last_certification_date': None,
                'breakdown': {
                    'certifications': 0,
                    'courses_given': 0,
                    'student_bonus': 0,
                    'instructor_bonus': 0,
                    'extra': 0,
                },
            }
            for c in consultants
        }

        # Regla 1: una certificación cuenta una sola vez por consultor (se toma la fecha más antigua)
        obtained = {}  # (consultant_id, certification_id) -> (fecha, certificación)
        for cc in ConsultantCertification.query.all():
            key = (cc.consultant_id, cc.certification_id)
            if key not in obtained or cc.obtained_at < obtained[key][0]:
                obtained[key] = (cc.obtained_at, cc.certification)

        for (consultant_id, _), (obtained_at, cert) in obtained.items():
            s = stats[consultant_id]
            s['certifications'] += 1
            s['breakdown']['certifications'] += cert.certification_type.points_base
            last = s['last_certification_date']
            if last is None or obtained_at > last:
                s['last_certification_date'] = obtained_at

        # Regla 3: el expositor recibe puntos por cada curso que imparte
        for session in CourseSession.query.all():
            s = stats[session.instructor_consultant_id]
            s['courses_given'] += 1
            s['breakdown']['courses_given'] += session.certification.certification_type.points_for_course

        # Regla 4: bonos si el alumno se certifica después de haber tomado el curso
        attendances = CourseAttendance.query.all()
        sessions_by_id = {s.id: s for s in CourseSession.query.all()}
        qualifying = {}  # (alumno, certificación) -> sesiones tomadas antes de certificarse
        for att in attendances:
            stats[att.consultant_id]['courses_taken'] += 1
            session = sessions_by_id[att.course_session_id]
            key = (att.consultant_id, session.certification_id)
            if key in obtained and session.session_date < obtained[key][0]:
                qualifying.setdefault(key, []).append(session)

        for (student_id, _), sessions in qualifying.items():
            cert_type = sessions[0].certification.certification_type
            # el alumno cobra una sola vez por certificación
            stats[student_id]['breakdown']['student_bonus'] += cert_type.points_for_student
            # todos los expositores distintos de sus cursos cobran
            for instructor_id in {s.instructor_consultant_id for s in sessions}:
                stats[instructor_id]['breakdown']['instructor_bonus'] += cert_type.points_for_instructor

        # Regla 5: puntos extra
        for extra in ConsultantExtraPoint.query.all():
            stats[extra.consultant_id]['breakdown']['extra'] += extra.points

        ranking = list(stats.values())
        for s in ranking:
            s['total_points'] = sum(s['breakdown'].values())

        # Regla 7: puntos desc; empate -> más certificaciones; luego certificación más reciente
        ranking.sort(key=lambda s: (
            -s['total_points'],
            -s['certifications'],
            -(s['last_certification_date'].toordinal() if s['last_certification_date'] else 0),
            s['full_name'].lower(),
        ))
        for position, s in enumerate(ranking, start=1):
            s['position'] = position
            last = s['last_certification_date']
            s['last_certification_date'] = last.isoformat() if last else None
        return ranking
