from flask import Blueprint, jsonify, request
from database import db
from models.certification_type import CertificationType
from sqlalchemy.exc import IntegrityError

certification_types_bp = Blueprint('certification_types', __name__)

@certification_types_bp.route('/certification-types', methods=['GET'])
def get_certification_types():
    types = CertificationType.query.order_by(CertificationType.id.asc()).all()
    return jsonify([t.to_dict() for t in types]), 200

@certification_types_bp.route('/certification-types/<int:id>', methods=['GET'])
def get_certification_type(id):
    cert_type = CertificationType.query.get_or_404(id)
    return jsonify(cert_type.to_dict()), 200

@certification_types_bp.route('/certification-types', methods=['POST'])
def create_certification_type():
    data = request.get_json()
    if not data.get('code'):
        return jsonify({"error": "code is required"}), 400
    
    try:
        new_type = CertificationType(
            code=data.get('code'),
            points_base=data.get('points_base', 0),
            points_for_course=data.get('points_for_course', 0),
            points_for_instructor=data.get('points_for_instructor', 0),
            points_for_student=data.get('points_for_student', 0)
        )
        db.session.add(new_type)
        db.session.commit()
        return jsonify(new_type.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Code already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@certification_types_bp.route('/certification-types/<int:id>', methods=['PUT'])
def update_certification_type(id):
    cert_type = CertificationType.query.get_or_404(id)
    data = request.get_json()
    
    try:
        if 'code' in data: cert_type.code = data.get('code')
        if 'points_base' in data: cert_type.points_base = data.get('points_base')
        if 'points_for_course' in data: cert_type.points_for_course = data.get('points_for_course')
        if 'points_for_instructor' in data: cert_type.points_for_instructor = data.get('points_for_instructor')
        if 'points_for_student' in data: cert_type.points_for_student = data.get('points_for_student')
        
        db.session.commit()
        return jsonify(cert_type.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Code already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@certification_types_bp.route('/certification-types/<int:id>', methods=['DELETE'])
def delete_certification_type(id):
    cert_type = CertificationType.query.get_or_404(id)
    try:
        db.session.delete(cert_type)
        db.session.commit()
        return '', 204
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Cannot delete record due to existing dependencies"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
