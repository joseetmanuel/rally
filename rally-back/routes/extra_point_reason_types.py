from flask import Blueprint, jsonify, request
from database import db
from models.extra_point_reason_type import ExtraPointReasonType
from sqlalchemy.exc import IntegrityError

extra_point_reason_types_bp = Blueprint('extra_point_reason_types', __name__)

@extra_point_reason_types_bp.route('/extra-point-reason-types', methods=['GET'])
def get_extra_point_reason_types():
    reasons = ExtraPointReasonType.query.order_by(ExtraPointReasonType.id.asc()).all()
    return jsonify([r.to_dict() for r in reasons]), 200

@extra_point_reason_types_bp.route('/extra-point-reason-types/<int:id>', methods=['GET'])
def get_extra_point_reason_type(id):
    reason = ExtraPointReasonType.query.get_or_404(id)
    return jsonify(reason.to_dict()), 200

@extra_point_reason_types_bp.route('/extra-point-reason-types', methods=['POST'])
def create_extra_point_reason_type():
    data = request.get_json()
    code = data.get('code')
    name = data.get('name')

    if not code or not name:
        return jsonify({"error": "code and name are required"}), 400

    try:
        new_reason = ExtraPointReasonType(
            code=code,
            name=name,
            description=data.get('description')
        )
        db.session.add(new_reason)
        db.session.commit()
        return jsonify(new_reason.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Code already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@extra_point_reason_types_bp.route('/extra-point-reason-types/<int:id>', methods=['PUT'])
def update_extra_point_reason_type(id):
    reason = ExtraPointReasonType.query.get_or_404(id)
    data = request.get_json()

    try:
        if 'code' in data: reason.code = data.get('code')
        if 'name' in data: reason.name = data.get('name')
        if 'description' in data: reason.description = data.get('description')
        
        db.session.commit()
        return jsonify(reason.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Code already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@extra_point_reason_types_bp.route('/extra-point-reason-types/<int:id>', methods=['DELETE'])
def delete_extra_point_reason_type(id):
    reason = ExtraPointReasonType.query.get_or_404(id)
    try:
        db.session.delete(reason)
        db.session.commit()
        return '', 204
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Cannot delete record due to existing dependencies"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
