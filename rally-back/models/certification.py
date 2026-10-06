from database import db
from sqlalchemy import UniqueConstraint

class Certification(db.Model):
    __tablename__ = 'certifications'
    id = db.Column(db.Integer, primary_key=True)
    vendor = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    certification_type_id = db.Column(db.Integer, db.ForeignKey('certification_types.id'), nullable=False)

    certification_type = db.relationship('CertificationType', lazy='joined')

    __table_args__ = (UniqueConstraint('vendor', 'name', name='_vendor_name_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'vendor': self.vendor,
            'name': self.name,
            'certification_type_id': self.certification_type_id,
            'type': {'id': self.certification_type.id, 'code': self.certification_type.code, 'points_base': self.certification_type.points_base} if self.certification_type else None
        }
