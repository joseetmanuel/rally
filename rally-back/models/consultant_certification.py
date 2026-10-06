from database import db
from sqlalchemy import UniqueConstraint

class ConsultantCertification(db.Model):
    __tablename__ = 'consultant_certifications'
    id = db.Column(db.Integer, primary_key=True)
    consultant_id = db.Column(db.Integer, db.ForeignKey('consultants.id'), nullable=False)
    certification_id = db.Column(db.Integer, db.ForeignKey('certifications.id'), nullable=False)
    obtained_at = db.Column(db.Date, nullable=False)
    reimbursement_amount = db.Column(db.Numeric(10, 2), default=0)
    paid_with_own_resources = db.Column(db.Boolean, default=False)
    reimbursement_registered = db.Column(db.Boolean, default=False)
    reimbursement_registered_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    certification = db.relationship('Certification', lazy='joined')

    __table_args__ = (UniqueConstraint('consultant_id', 'certification_id', 'obtained_at', name='_consultant_cert_obtained_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'consultant_id': self.consultant_id,
            'certification_id': self.certification_id,
            'obtained_at': self.obtained_at.isoformat() if self.obtained_at else None,
            'reimbursement_amount': float(self.reimbursement_amount) if self.reimbursement_amount else 0.0,
            'paid_with_own_resources': self.paid_with_own_resources,
            'reimbursement_registered': self.reimbursement_registered,
            'reimbursement_registered_at': self.reimbursement_registered_at.isoformat() if self.reimbursement_registered_at else None,
            'notes': self.notes,
            'certification': {'id': self.certification.id, 'vendor': self.certification.vendor, 'name': self.certification.name} if self.certification else None
        }
