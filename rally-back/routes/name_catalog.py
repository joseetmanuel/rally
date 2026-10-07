from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError
from database import db


def make_name_catalog_blueprint(bp_name, url, model, related_models=()):
    """CRUD de un catálogo simple de un solo campo `name` (único).

    `related_models`: pares (modelo, columna FK) que impiden borrar un registro en uso.
    """
    bp = Blueprint(bp_name, __name__)

    def clean_name(data):
        name = (data or {}).get('name')
        return name.strip() if isinstance(name, str) and name.strip() else None

    @bp.route(f'/{url}', methods=['GET'], endpoint='list')
    def list_items():
        items = model.query.order_by(model.name.asc()).all()
        return jsonify([i.to_dict() for i in items]), 200

    @bp.route(f'/{url}/<int:id>', methods=['GET'], endpoint='get')
    def get_item(id):
        return jsonify(model.query.get_or_404(id).to_dict()), 200

    @bp.route(f'/{url}', methods=['POST'], endpoint='create')
    def create_item():
        name = clean_name(request.get_json())
        if not name:
            return jsonify({"error": "name is required"}), 400
        try:
            item = model(name=name)
            db.session.add(item)
            db.session.commit()
            return jsonify(item.to_dict()), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Name already exists"}), 409

    @bp.route(f'/{url}/<int:id>', methods=['PUT'], endpoint='update')
    def update_item(id):
        item = model.query.get_or_404(id)
        name = clean_name(request.get_json())
        if not name:
            return jsonify({"error": "name is required"}), 400
        try:
            item.name = name
            db.session.commit()
            return jsonify(item.to_dict()), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Name already exists"}), 409

    @bp.route(f'/{url}/<int:id>', methods=['DELETE'], endpoint='delete')
    def delete_item(id):
        item = model.query.get_or_404(id)
        for related, column in related_models:
            if related.query.filter(column == id).first():
                return jsonify({"error": "Cannot delete: it is in use by consultants"}), 409
        db.session.delete(item)
        db.session.commit()
        return '', 204

    return bp
