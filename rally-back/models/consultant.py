from database import db

class Consultant(db.Model):
    __tablename__ = 'consultants'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    participant_type = db.Column(db.String(50), nullable=False) # INTERNO o EXTERNO
    team_number = db.Column(db.Integer, nullable=False)
    consulting_firm_name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True)
    teams_contact = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'participant_type': self.participant_type,
            'team_number': self.team_number,
            'consulting_firm_name': self.consulting_firm_name,
            'email': self.email,
            'teams_contact': self.teams_contact
        }
