"""Estructura jerárquica: CTO -> Dirección -> Subdirección -> Gerencia -> participantes.

Cada nivel es su propia tabla (se maneja por ID) con el nombre de la unidad y el de quien la encabeza, ambos
editables. Sólo el administrador puede leer o escribir esta estructura. No hay DELETE: la estructura se edita,
no se borra (los participantes dependen de ella).
"""
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from database import db
from models.consultant import Consultant
from models.org_structure import Cto, Direction, Management, Subdirection

org_structure_bp = Blueprint('org_structure', __name__)

# (url, modelo, columna del padre, modelo del padre)
LEVELS = [
    ('ctos', Cto, None, None),
    ('directions', Direction, 'cto_id', Cto),
    ('subdirections', Subdirection, 'direction_id', Direction),
    ('managements', Management, 'subdirection_id', Subdirection),
]


def _text(data, key):
    value = (data or {}).get(key)
    return value.strip() if isinstance(value, str) else None


def _make_level(url, model, parent_column, parent_model):
    def list_items():
        return jsonify([i.to_dict() for i in model.query.order_by(model.name.asc(), model.id.asc()).all()]), 200

    def get_item(id):
        return jsonify(model.query.get_or_404(id).to_dict()), 200

    def check_references(data):
        """Valida el padre y la persona enlazada que vengan en `data`. Devuelve un mensaje de error o None."""
        if parent_column and parent_column in data:
            if not isinstance(data[parent_column], int) or not db.session.get(parent_model, data[parent_column]):
                return f'{parent_column} must be an existing {parent_model.__tablename__} id'
        if data.get('head_consultant_id') is not None:
            if not isinstance(data['head_consultant_id'], int) or not db.session.get(Consultant, data['head_consultant_id']):
                return 'head_consultant_id must be an existing consultant id'
        return None

    def create_item():
        data = request.get_json() or {}
        name = _text(data, 'name')
        if not name:
            return jsonify({'error': 'name is required'}), 400
        if parent_column and parent_column not in data:
            return jsonify({'error': f'{parent_column} is required'}), 400
        error = check_references(data)
        if error:
            return jsonify({'error': error}), 400
        item = model(name=name, head_name=_text(data, 'head_name') or '',
                     head_consultant_id=data.get('head_consultant_id'))
        if parent_column:
            setattr(item, parent_column, data[parent_column])
        try:
            db.session.add(item)
            db.session.commit()
            return jsonify(item.to_dict()), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'error': 'Name already exists in this parent'}), 409

    def update_item(id):
        item = model.query.get_or_404(id)
        data = request.get_json() or {}
        if 'name' in data:
            name = _text(data, 'name')
            if not name:
                return jsonify({'error': 'name is required'}), 400
            item.name = name
        if 'head_name' in data:
            item.head_name = _text(data, 'head_name') or ''
        error = check_references(data)
        if error:
            return jsonify({'error': error}), 400
        if 'head_consultant_id' in data:
            item.head_consultant_id = data['head_consultant_id']
        if parent_column and parent_column in data:
            setattr(item, parent_column, data[parent_column])
        try:
            db.session.commit()
            return jsonify(item.to_dict()), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({'error': 'Name already exists in this parent'}), 409

    org_structure_bp.add_url_rule(f'/{url}', f'{url}_list', list_items, methods=['GET'])
    org_structure_bp.add_url_rule(f'/{url}/<int:id>', f'{url}_get', get_item, methods=['GET'])
    org_structure_bp.add_url_rule(f'/{url}', f'{url}_create', create_item, methods=['POST'])
    org_structure_bp.add_url_rule(f'/{url}/<int:id>', f'{url}_update', update_item, methods=['PUT'])


for _level in LEVELS:
    _make_level(*_level)


@org_structure_bp.route('/org-structure', methods=['GET'])
def get_org_structure():
    """Árbol completo anidado (CTO > Direcciones > Subdirecciones > Gerencias, con su número de participantes)."""
    counts = {}
    for management_id, in db.session.query(Consultant.management_id).filter(Consultant.management_id.isnot(None)):
        counts[management_id] = counts.get(management_id, 0) + 1

    def with_children(items, key, children_by_parent):
        return [{**i.to_dict(), key: children_by_parent.get(i.id, [])} for i in items]

    managements = {}
    for m in Management.query.order_by(Management.name, Management.id).all():
        managements.setdefault(m.subdirection_id, []).append({**m.to_dict(), 'participants': counts.get(m.id, 0)})
    subdirections = {}
    for s in Subdirection.query.order_by(Subdirection.name, Subdirection.id).all():
        subdirections.setdefault(s.direction_id, []).append({**s.to_dict(), 'managements': managements.get(s.id, [])})
    directions = {}
    for d in Direction.query.order_by(Direction.name, Direction.id).all():
        directions.setdefault(d.cto_id, []).append({**d.to_dict(), 'subdirections': subdirections.get(d.id, [])})
    return jsonify(with_children(Cto.query.order_by(Cto.name, Cto.id).all(), 'directions', directions)), 200
