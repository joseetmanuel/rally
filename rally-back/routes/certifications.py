from flask import Blueprint, jsonify, request
from database import db
from models.certification import Certification
from models.certification_type import CertificationType
from sqlalchemy.exc import IntegrityError

certifications_bp = Blueprint('certifications', __name__)

@certifications_bp.route('/certifications', methods=['GET'])
def get_certifications():
    certs = Certification.query.order_by(Certification.id.asc()).all()
    return jsonify([c.to_dict() for c in certs]), 200

@certifications_bp.route('/certifications/<int:id>', methods=['GET'])
def get_certification(id):
    cert = Certification.query.get_or_404(id)
    return jsonify(cert.to_dict()), 200

@certifications_bp.route('/certifications', methods=['POST'])
def create_certification():
    data = request.get_json()
    
    vendor = data.get('vendor')
    name = data.get('name')
    type_id = data.get('certification_type_id')

    if not vendor or not name or not type_id:
        return jsonify({"error": "vendor, name and certification_type_id are required"}), 400

    if not CertificationType.query.get(type_id):
        return jsonify({"error": "certification_type_id does not exist"}), 400

    try:
        new_cert = Certification(
            vendor=vendor,
            name=name,
            certification_type_id=type_id
        )
        db.session.add(new_cert)
        db.session.commit()
        return jsonify(new_cert.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Certification with this vendor and name already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@certifications_bp.route('/certifications/<int:id>', methods=['PUT'])
def update_certification(id):
    cert = Certification.query.get_or_404(id)
    data = request.get_json()

    if 'certification_type_id' in data:
        if not CertificationType.query.get(data.get('certification_type_id')):
            return jsonify({"error": "certification_type_id does not exist"}), 400

    try:
        if 'vendor' in data: cert.vendor = data.get('vendor')
        if 'name' in data: cert.name = data.get('name')
        if 'certification_type_id' in data: cert.certification_type_id = data.get('certification_type_id')
        
        db.session.commit()
        return jsonify(cert.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Certification with this vendor and name already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@certifications_bp.route('/certifications/<int:id>', methods=['DELETE'])
def delete_certification(id):
    cert = Certification.query.get_or_404(id)
    try:
        db.session.delete(cert)
        db.session.commit()
        return '', 204
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Cannot delete certification due to existing related records"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
