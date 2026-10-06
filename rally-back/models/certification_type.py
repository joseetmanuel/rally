from database import db

class CertificationType(db.Model):
    __tablename__ = 'certification_types'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    points_base = db.Column(db.SmallInteger, nullable=False, default=0)
    points_for_course = db.Column(db.SmallInteger, nullable=False, default=0)
    points_for_instructor = db.Column(db.SmallInteger, nullable=False, default=0)
    points_for_student = db.Column(db.SmallInteger, nullable=False, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'points_base': self.points_base,
            'points_for_course': self.points_for_course,
            'points_for_instructor': self.points_for_instructor,
            'points_for_student': self.points_for_student
        }
