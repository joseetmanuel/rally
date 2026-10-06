from database import db

class ConsultantExtraPoint(db.Model):
    __tablename__ = 'consultant_extra_points'
    id = db.Column(db.Integer, primary_key=True)
    consultant_id = db.Column(db.Integer, db.ForeignKey('consultants.id'), nullable=False)
    extra_point_reason_type_id = db.Column(db.Integer, db.ForeignKey('extra_point_reason_types.id'), nullable=False)
    points = db.Column(db.Integer, default=0, nullable=False)
    awarded_at = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)
    course_session_id = db.Column(db.Integer, db.ForeignKey('course_sessions.id'), nullable=True)
    consultant_certification_id = db.Column(db.Integer, db.ForeignKey('consultant_certifications.id'), nullable=True)

    consultant = db.relationship('Consultant', lazy='joined')
    reason_type = db.relationship('ExtraPointReasonType', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'consultant_id': self.consultant_id,
            'extra_point_reason_type_id': self.extra_point_reason_type_id,
            'points': self.points,
            'awarded_at': self.awarded_at.isoformat() if self.awarded_at else None,
            'notes': self.notes,
            'course_session_id': self.course_session_id,
            'consultant_certification_id': self.consultant_certification_id,
            'consultant': {'id': self.consultant.id, 'full_name': self.consultant.full_name} if self.consultant else None,
            'reason_type': {'id': self.reason_type.id, 'code': self.reason_type.code, 'name': self.reason_type.name} if self.reason_type else None
        }
