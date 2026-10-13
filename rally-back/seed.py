from app import create_app
from database import db
from models.certification_type import CertificationType
from models.extra_point_reason_type import ExtraPointReasonType
from models.certification import Certification
from models.team import Team
from models.consulting_firm import ConsultingFirm
from models.consultant import Consultant
from models.org_structure import Cto, Direction, Subdirection, Management

TEAMS = ['Elastic', 'LC/GR', 'Call', 'SI+', 'NBM', 'Gerente', 'Equipo Cross']
CONSULTING_FIRMS = ['Antal', 'Corus', 'Wayssen', 'Qualtop', 'MaterSys', 'Inetum', 'POSITIVO S+']

# Catálogo de certificaciones del Rally 2026 (lámina "Participa en el rally de certificaciones").
# (proveedor, nombre, tipo). El tipo sale de la etiqueta de cada insignia en la lámina.
CERTIFICATIONS = [
    # Ruta AWS
    ('AWS', 'Cloud Practitioner', 'FUNDACIONAL'),
    ('AWS', 'Developer Associate', 'PROFESIONAL'),
    ('AWS', 'Solutions Architect Associate', 'EXPERTO'),
    ('AWS', 'SysOps Administrator Associate', 'EXPERTO'),
    ('AWS', 'DevOps Engineer Professional', 'OPCIONAL'),
    # Ruta Azure
    ('Microsoft', 'Azure Fundamentals', 'FUNDACIONAL'),
    ('Microsoft', 'Azure AI Fundamentals', 'FUNDACIONAL'),
    ('Microsoft', 'Azure Administrator Associate', 'PROFESIONAL'),
    ('Microsoft', 'Azure Developer Associate', 'EXPERTO'),
    ('Microsoft', 'Azure Solutions Architect Expert', 'OPCIONAL'),
    ('Microsoft', 'Azure DevOps Engineer Expert', 'OPCIONAL'),
    # Ruta GCP
    ('Google Cloud', 'Cloud Digital Leader', 'FUNDACIONAL'),
    ('Google Cloud', 'Generative AI Leader', 'FUNDACIONAL'),
    ('Google Cloud', 'Associate Cloud Engineer', 'PROFESIONAL'),
    ('Google Cloud', 'Professional Cloud Architect', 'OPCIONAL'),
    ('Google Cloud', 'Professional Cloud DevOps Engineer', 'OPCIONAL'),
    ('Google Cloud', 'Professional Cloud Developer', 'EXPERTO'),
    # Ruta Python
    ('Python Institute', 'PCEP - Certified Entry-Level Python Programmer', 'FUNDACIONAL'),
    ('Python Institute', 'PCAP - Certified Associate Python Programmer', 'PROFESIONAL'),
    ('Python Institute', 'PCPP1 - Certified Professional in Python Programming 1', 'EXPERTO'),
    ('Python Institute', 'PCPP2 - Certified Professional in Python Programming 2', 'OPCIONAL'),
]

def seed_org_structure():
    """Estructura inicial: CTO Tecnología > Dirección Core Bancario > Subdirección Ingeniería de Software >
    Gerencia Reingeniería de Software. Sólo se crea si todavía no hay ningún CTO (nunca pisa lo que se editó
    desde la pantalla de administración); en ese momento los participantes sin gerencia pasan a la inicial."""
    if Cto.query.first():
        return
    print("Seeding org structure...")
    cto = Cto(name='Tecnología', head_name='Óscar')
    direction = Direction(name='Core Bancario', head_name='Karla', cto=cto)
    subdirection = Subdirection(name='Ingeniería de Software', head_name='Teodoro', direction=direction)
    management = Management(name='Reingeniería de Software', head_name='José', subdirection=subdirection)
    db.session.add_all([cto, direction, subdirection, management])
    db.session.flush()
    Consultant.query.filter(Consultant.management_id.is_(None)).update({'management_id': management.id})


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
            },
            {
                "code": "PRIMERA_CERT_FEB",
                "name": "Puntos por 1ra Cert Feb",
                "description": "Punto por la primera certificación obtenida en febrero"
            },
            {
                "code": "PRIMERA_CERT_ABR_MAY",
                "name": "Puntos por 1ra Cert Abril-Mayo",
                "description": "Punto por la primera certificación obtenida en abril-mayo"
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

        # 3. Equipos y consultoras (sólo se insertan los que faltan; no se tocan los existentes)
        print("Seeding Teams and ConsultingFirms...")
        for model, names in ((Team, TEAMS), (ConsultingFirm, CONSULTING_FIRMS)):
            for name in names:
                if not model.query.filter_by(name=name).first():
                    db.session.add(model(name=name))

        # 4. Certificaciones (necesita los tipos ya insertados; sólo se agregan las que faltan)
        print("Seeding Certifications...")
        db.session.flush()
        type_ids = {t.code: t.id for t in CertificationType.query.all()}
        for vendor, name, type_code in CERTIFICATIONS:
            if not Certification.query.filter_by(vendor=vendor, name=name).first():
                db.session.add(Certification(vendor=vendor, name=name, certification_type_id=type_ids[type_code]))

        # 5. Estructura jerárquica inicial (sólo si no existe)
        seed_org_structure()

        db.session.commit()
        print("Seed completed successfully!")

if __name__ == "__main__":
    seed_catalogs()
