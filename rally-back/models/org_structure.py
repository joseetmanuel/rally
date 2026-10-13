from database import db


class _OrgUnit:
    """Campos comunes de un nivel de la estructura: nombre de la unidad y de quien la encabeza.

    `name` es la unidad (p. ej. "Core Bancario"); `head_name` es la persona que la encabeza (p. ej. "Karla").
    `head_consultant_id` enlaza (opcional) a esa persona cuando también participa en el Rally.
    Ambos nombres se editan desde la pantalla de administración; todo se maneja por ID.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    head_name = db.Column(db.String(150), nullable=False, default='')

    @staticmethod
    def head_fk(table):
        # use_alter: consultants -> managements -> consultants forma un ciclo; esta llave se crea aparte
        return db.Column(db.Integer, db.ForeignKey('consultants.id', use_alter=True, name=f'fk_{table}_head_consultant'),
                         nullable=True)


class Cto(db.Model, _OrgUnit):
    """Nivel 1: CTO."""
    __tablename__ = 'ctos'
    head_consultant_id = _OrgUnit.head_fk('ctos')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'head_name': self.head_name,
                'head_consultant_id': self.head_consultant_id}


class Direction(db.Model, _OrgUnit):
    """Nivel 2: Dirección (pertenece a un CTO)."""
    __tablename__ = 'directions'
    cto_id = db.Column(db.Integer, db.ForeignKey('ctos.id'), nullable=False)
    head_consultant_id = _OrgUnit.head_fk('directions')
    cto = db.relationship('Cto', lazy='joined')
    __table_args__ = (db.UniqueConstraint('cto_id', 'name', name='uq_directions_cto_name'),)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'head_name': self.head_name,
                'head_consultant_id': self.head_consultant_id, 'cto_id': self.cto_id}


class Subdirection(db.Model, _OrgUnit):
    """Nivel 3: Subdirección (pertenece a una Dirección)."""
    __tablename__ = 'subdirections'
    direction_id = db.Column(db.Integer, db.ForeignKey('directions.id'), nullable=False)
    head_consultant_id = _OrgUnit.head_fk('subdirections')
    direction = db.relationship('Direction', lazy='joined')
    __table_args__ = (db.UniqueConstraint('direction_id', 'name', name='uq_subdirections_direction_name'),)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'head_name': self.head_name,
                'head_consultant_id': self.head_consultant_id, 'direction_id': self.direction_id,
                'cto_id': self.direction.cto_id}


class Management(db.Model, _OrgUnit):
    """Nivel 4: Gerencia (pertenece a una Subdirección). Los participantes pertenecen a una gerencia."""
    __tablename__ = 'managements'
    subdirection_id = db.Column(db.Integer, db.ForeignKey('subdirections.id'), nullable=False)
    head_consultant_id = _OrgUnit.head_fk('managements')
    subdirection = db.relationship('Subdirection', lazy='joined')
    __table_args__ = (db.UniqueConstraint('subdirection_id', 'name', name='uq_managements_subdirection_name'),)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'head_name': self.head_name,
                'head_consultant_id': self.head_consultant_id, 'subdirection_id': self.subdirection_id,
                'direction_id': self.subdirection.direction_id, 'cto_id': self.subdirection.direction.cto_id}
