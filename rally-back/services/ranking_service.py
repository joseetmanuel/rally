from models.consultant import Consultant
from models.consultant_certification import ConsultantCertification
from models.consultant_extra_point import ConsultantExtraPoint
from models.course_attendance import CourseAttendance
from models.course_session import CourseSession

# Orden de los movimientos que ocurren el mismo día
KIND_ORDER = ['certification', 'course_given', 'student_bonus', 'instructor_bonus', 'extra']
# kind del movimiento -> clave del desglose del ranking
BREAKDOWN_KEY = {
    'certification': 'certifications',
    'course_given': 'courses_given',
    'student_bonus': 'student_bonus',
    'instructor_bonus': 'instructor_bonus',
    'extra': 'extra',
}


class RankingService:
    """Calcula el ranking dinámicamente (Regla 6) a partir de los registros base.

    puntaje_total = certificaciones + cursos impartidos + bono alumno
                    + bono expositor + puntos extra

    Todo el puntaje sale de una única lista de movimientos (`ledger`) por consultor. El ranking
    suma esos movimientos y el estado de cuenta los muestra, por lo que ambos siempre coinciden.
    """

    @staticmethod
    def _compute():
        """Devuelve (stats por consultor, movimientos por consultor)."""
        consultants = Consultant.query.all()
        names = {c.id: c.full_name for c in consultants}
        stats = {
            c.id: {
                'consultant_id': c.id,
                'full_name': c.full_name,
                'team': c.team.name if c.team else None,
                'certifications': 0,
                'courses_given': 0,
                'courses_taken': 0,
                'last_certification_date': None,
                'breakdown': {key: 0 for key in BREAKDOWN_KEY.values()},
            }
            for c in consultants
        }
        ledger = {c.id: [] for c in consultants}

        def add(consultant_id, day, kind, points, title, detail=''):
            # title = asunto del movimiento (certificación, curso, motivo); el tipo va en `kind`
            ledger[consultant_id].append(
                {'date': day, 'kind': kind, 'points': points, 'title': title, 'detail': detail})

        # Regla 1: una certificación cuenta una sola vez por consultor (se toma la fecha más antigua)
        obtained = {}  # (consultant_id, certification_id) -> (fecha, certificación)
        for cc in ConsultantCertification.query.all():
            key = (cc.consultant_id, cc.certification_id)
            if key not in obtained or cc.obtained_at < obtained[key][0]:
                obtained[key] = (cc.obtained_at, cc.certification)

        for (consultant_id, _), (obtained_at, cert) in obtained.items():
            s = stats[consultant_id]
            s['certifications'] += 1
            last = s['last_certification_date']
            if last is None or obtained_at > last:
                s['last_certification_date'] = obtained_at
            cert_type = cert.certification_type
            add(consultant_id, obtained_at, 'certification', cert_type.points_base,
                cert.name, f'{cert.vendor} · {cert_type.code.capitalize()}')

        # Asistentes por sesión (para describir los cursos impartidos)
        attendances = CourseAttendance.query.all()
        attendees = {}
        for att in attendances:
            attendees[att.course_session_id] = attendees.get(att.course_session_id, 0) + 1

        # Regla 3: el expositor recibe puntos por cada curso que imparte
        sessions_by_id = {}
        for session in CourseSession.query.all():
            sessions_by_id[session.id] = session
            s = stats[session.instructor_consultant_id]
            s['courses_given'] += 1
            cert = session.certification
            count = attendees.get(session.id, 0)
            people = f'{count} asistente' + ('' if count == 1 else 's')
            add(session.instructor_consultant_id, session.session_date, 'course_given',
                cert.certification_type.points_for_course,
                session.title or cert.name, f'{cert.name} · {people}')

        # Regla 4: bonos si el alumno se certifica después de haber tomado el curso
        qualifying = {}  # (alumno, certificación) -> sesiones tomadas antes de certificarse
        for att in attendances:
            stats[att.consultant_id]['courses_taken'] += 1
            session = sessions_by_id[att.course_session_id]
            key = (att.consultant_id, session.certification_id)
            if key in obtained and session.session_date < obtained[key][0]:
                qualifying.setdefault(key, []).append(session)

        for (student_id, _), sessions in qualifying.items():
            obtained_at, cert = obtained[(student_id, sessions[0].certification_id)]
            cert_type = cert.certification_type
            instructors = sorted({s.instructor_consultant_id for s in sessions}, key=lambda i: names[i].lower())
            # el alumno cobra una sola vez por certificación
            add(student_id, obtained_at, 'student_bonus', cert_type.points_for_student,
                cert.name,
                'Te certificaste tras tomar el curso de ' + ' y '.join(names[i] for i in instructors))
            # todos los expositores distintos de sus cursos cobran
            for instructor_id in instructors:
                add(instructor_id, obtained_at, 'instructor_bonus', cert_type.points_for_instructor,
                    cert.name, f'{names[student_id]} se certificó tras tu curso')

        # Regla 5: puntos extra
        for extra in ConsultantExtraPoint.query.all():
            reason = extra.reason_type.name if extra.reason_type else 'Puntos extra'
            add(extra.consultant_id, extra.awarded_at.date(), 'extra', extra.points,
                reason, extra.notes or '')

        # El desglose y el total del ranking son la suma de los movimientos
        for consultant_id, entries in ledger.items():
            for entry in entries:
                stats[consultant_id]['breakdown'][BREAKDOWN_KEY[entry['kind']]] += entry['points']
            stats[consultant_id]['total_points'] = sum(stats[consultant_id]['breakdown'].values())

        return stats, ledger

    @staticmethod
    def _rank(stats):
        ranking = list(stats.values())
        # Regla 7: puntos desc; empate -> más certificaciones; luego certificación más reciente
        ranking.sort(key=lambda s: (
            -s['total_points'],
            -s['certifications'],
            -(s['last_certification_date'].toordinal() if s['last_certification_date'] else 0),
            s['full_name'].lower(),
        ))
        for position, s in enumerate(ranking, start=1):
            s['position'] = position
        return ranking

    @staticmethod
    def calculate_ranking():
        stats, _ = RankingService._compute()
        ranking = RankingService._rank(stats)
        for s in ranking:
            last = s['last_certification_date']
            s['last_certification_date'] = last.isoformat() if last else None
        return ranking

    @staticmethod
    def statement(consultant_id):
        """Estado de cuenta de un participante: sus movimientos de puntos con saldo acumulado.

        Devuelve None si el consultor no existe.
        """
        consultant = Consultant.query.get(consultant_id)
        if not consultant:
            return None

        stats, ledger = RankingService._compute()
        RankingService._rank(stats)
        s = stats[consultant_id]

        entries = sorted(ledger[consultant_id], key=lambda e: (e['date'], KIND_ORDER.index(e['kind'])))
        balance = 0
        for entry in entries:
            balance += entry['points']
            entry['balance'] = balance
            entry['date'] = entry['date'].isoformat()

        last = s['last_certification_date']
        return {
            'consultant': {
                'id': consultant.id,
                'full_name': consultant.full_name,
                'participant_type': consultant.participant_type,
                'team': consultant.team.name if consultant.team else None,
                'consulting_firm': consultant.consulting_firm.name if consultant.consulting_firm else None,
            },
            'position': s['position'],
            'participants': len(stats),
            'total_points': s['total_points'],
            'certifications': s['certifications'],
            'courses_given': s['courses_given'],
            'courses_taken': s['courses_taken'],
            'last_certification_date': last.isoformat() if last else None,
            'breakdown': s['breakdown'],
            'entries': entries,
        }
