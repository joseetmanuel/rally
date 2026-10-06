from database import db

class CourseSession(db.Model):
    __tablename__ = 'course_sessions'
    id = db.Column(db.Integer, primary_key=True)
    certification_id = db.Column(db.Integer, db.ForeignKey('certifications.id'), nullable=False)
    instructor_consultant_id = db.Column(db.Integer, db.ForeignKey('consultants.id'), nullable=False)
    session_date = db.Column(db.Date, nullable=False)
    title = db.Column(db.String(255))
    notes = db.Column(db.Text)

    certification = db.relationship('Certification', lazy='joined')
    instructor = db.relationship('Consultant', foreign_keys=[instructor_consultant_id], lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'certification_id': self.certification_id,
            'instructor_consultant_id': self.instructor_consultant_id,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'title': self.title,
            'notes': self.notes,
            'certification': {'id': self.certification.id, 'vendor': self.certification.vendor, 'name': self.certification.name} if self.certification else None,
            'instructor': {'id': self.instructor.id, 'full_name': self.instructor.full_name} if self.instructor else None
        }
