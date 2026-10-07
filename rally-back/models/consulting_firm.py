from database import db


class ConsultingFirm(db.Model):
    """Catálogo de consultoras externas (Antal, Corus, Wayssen...)."""
    __tablename__ = 'consulting_firms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}
