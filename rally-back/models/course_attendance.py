from database import db
from sqlalchemy import UniqueConstraint

class CourseAttendance(db.Model):
    __tablename__ = 'course_attendances'
    id = db.Column(db.Integer, primary_key=True)
    course_session_id = db.Column(db.Integer, db.ForeignKey('course_sessions.id'), nullable=False)
    consultant_id = db.Column(db.Integer, db.ForeignKey('consultants.id'), nullable=False)
    points_obtained = db.Column(db.Integer, default=0, nullable=False)
    notes = db.Column(db.Text)

    consultant = db.relationship('Consultant', lazy='joined')

    __table_args__ = (UniqueConstraint('course_session_id', 'consultant_id', name='_course_session_consultant_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'course_session_id': self.course_session_id,
            'consultant_id': self.consultant_id,
            'points_obtained': self.points_obtained,
            'notes': self.notes,
            'consultant': {'id': self.consultant.id, 'full_name': self.consultant.full_name} if self.consultant else None
        }
