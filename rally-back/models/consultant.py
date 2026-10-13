from database import db

class Consultant(db.Model):
    __tablename__ = 'consultants'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    participant_type = db.Column(db.String(50), nullable=False) # INTERNO o EXTERNO
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    consulting_firm_id = db.Column(db.Integer, db.ForeignKey('consulting_firms.id'), nullable=True)
    email = db.Column(db.String(255), unique=True)
    teams_contact = db.Column(db.String(255))
    # Gerencia a la que pertenece (de ahí se deducen subdirección, dirección y CTO). Opcional en la base.
    management_id = db.Column(db.Integer, db.ForeignKey('managements.id'), nullable=True)

    team = db.relationship('Team', lazy='joined')
    consulting_firm = db.relationship('ConsultingFirm', lazy='joined')
    management = db.relationship('Management', lazy='joined', foreign_keys=[management_id])

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'participant_type': self.participant_type,
            'team_id': self.team_id,
            'consulting_firm_id': self.consulting_firm_id,
            'management_id': self.management_id,
            'subdirection_id': self.management.subdirection_id if self.management else None,
            'direction_id': self.management.subdirection.direction_id if self.management else None,
            'cto_id': self.management.subdirection.direction.cto_id if self.management else None,
            'team': self.team.to_dict() if self.team else None,
            'consulting_firm': self.consulting_firm.to_dict() if self.consulting_firm else None,
            'email': self.email,
            'teams_contact': self.teams_contact
        }
