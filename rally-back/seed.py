from app import create_app
from database import db
from models.certification_type import CertificationType
from models.extra_point_reason_type import ExtraPointReasonType

def seed_catalogs():
    app = create_app()
    with app.app_context():
        # 1. Certification Types
        cert_types = [
            {
                "code": "FUNDACIONAL",
                "points_base": 10,
                "points_for_course": 5,
                "points_for_instructor": 1,
                "points_for_student": 2
            },
            {
                "code": "PROFESIONAL",
                "points_base": 30,
                "points_for_course": 15,
                "points_for_instructor": 3,
                "points_for_student": 6
            },
            {
                "code": "EXPERTO",
                "points_base": 60,
                "points_for_course": 30,
                "points_for_instructor": 6,
                "points_for_student": 12
            },
            {
                "code": "OPCIONAL",
                "points_base": 70,
                "points_for_course": 35,
                "points_for_instructor": 7,
                "points_for_student": 14
            }
        ]

        print("Seeding CertificationTypes...")
        for data in cert_types:
            cert_type = CertificationType.query.filter_by(code=data["code"]).first()
            if cert_type:
                cert_type.points_base = data["points_base"]
                cert_type.points_for_course = data["points_for_course"]
                cert_type.points_for_instructor = data["points_for_instructor"]
                cert_type.points_for_student = data["points_for_student"]
            else:
                cert_type = CertificationType(**data)
                db.session.add(cert_type)
        
        # 2. Extra Point Reason Types
        extra_point_reasons = [
            {
                "code": "PUNTO_EXTRA",
                "name": "Punto extra",
                "description": "Puntos extraordinarios asignados manualmente por criterio del evento"
            },
            {
                "code": "APOYO_ORGANIZACION",
                "name": "Apoyo a la organización",
                "description": "Puntos otorgados por apoyo relevante en actividades de organización del rally o certificación"
            },
            {
                "code": "PARTICIPACION_DESTACADA",
                "name": "Participación destacada",
                "description": "Puntos otorgados por participación sobresaliente"
            },
            {
                "code": "DINAMICA_ESPECIAL",
                "name": "Dinámica especial",
                "description": "Puntos obtenidos en dinámicas especiales del evento"
            }
        ]

        print("Seeding ExtraPointReasonTypes...")
        for data in extra_point_reasons:
            reason = ExtraPointReasonType.query.filter_by(code=data["code"]).first()
            if reason:
                reason.name = data["name"]
                reason.description = data["description"]
            else:
                reason = ExtraPointReasonType(**data)
                db.session.add(reason)

        db.session.commit()
        print("Seed completed successfully!")

if __name__ == "__main__":
    seed_catalogs()
