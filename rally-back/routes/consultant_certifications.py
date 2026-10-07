from flask import Blueprint, jsonify, request
from database import db
from models.consultant_certification import ConsultantCertification
from models.consultant import Consultant
from models.certification import Certification
from sqlalchemy.exc import IntegrityError
from datetime import date, datetime

consultant_certifications_bp = Blueprint('consultant_certifications', __name__)

@consultant_certifications_bp.route('/consultant-certifications', methods=['GET'])
def get_consultant_certifications():
    certs = ConsultantCertification.query.order_by(ConsultantCertification.id.asc()).all()
    return jsonify([c.to_dict() for c in certs]), 200

@consultant_certifications_bp.route('/consultant-certifications/<int:id>', methods=['GET'])
def get_consultant_certification(id):
    cert = ConsultantCertification.query.get_or_404(id)
    return jsonify(cert.to_dict()), 200

@consultant_certifications_bp.route('/consultant-certifications', methods=['POST'])
def create_consultant_certification():
    data = request.get_json()
    
    consultant_id = data.get('consultant_id')
    certification_id = data.get('certification_id')
    obtained_at_str = data.get('obtained_at')

    if not consultant_id or not certification_id or not obtained_at_str:
        return jsonify({"error": "consultant_id, certification_id and obtained_at are required"}), 400

    if not Consultant.query.get(consultant_id):
        return jsonify({"error": "consultant_id does not exist"}), 400
    if not Certification.query.get(certification_id):
        return jsonify({"error": "certification_id does not exist"}), 400

    try:
        obtained_at = datetime.strptime(obtained_at_str, '%Y-%m-%d').date()
        if obtained_at > date.today():
            return jsonify({"error": "obtained_at cannot be in the future"}), 400

        # Reimbursement amount check
        amount = data.get('reimbursement_amount', 0)
        if amount and float(amount) < 0:
            return jsonify({"error": "reimbursement_amount must be >= 0"}), 400

        new_record = ConsultantCertification(
            consultant_id=consultant_id,
            certification_id=certification_id,
            obtained_at=obtained_at,
            reimbursement_amount=amount,
            paid_with_own_resources=data.get('paid_with_own_resources', False),
            reimbursement_registered=data.get('reimbursement_registered', False),
            reimbursement_registered_at=datetime.fromisoformat(data.get('reimbursement_registered_at')) if data.get('reimbursement_registered_at') else None,
            notes=data.get('notes')
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify(new_record.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Record with this consultant, certification and date already exists"}), 409
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultant_certifications_bp.route('/consultant-certifications/<int:id>', methods=['PUT'])
def update_consultant_certification(id):
    record = ConsultantCertification.query.get_or_404(id)
    data = request.get_json()

    try:
        if 'consultant_id' in data:
            if not Consultant.query.get(data.get('consultant_id')):
                return jsonify({"error": "consultant_id does not exist"}), 400
            record.consultant_id = data.get('consultant_id')
        
        if 'certification_id' in data:
            if not Certification.query.get(data.get('certification_id')):
                return jsonify({"error": "certification_id does not exist"}), 400
            record.certification_id = data.get('certification_id')

        if 'obtained_at' in data:
            obtained_at = datetime.strptime(data.get('obtained_at'), '%Y-%m-%d').date()
            if obtained_at > date.today():
                return jsonify({"error": "obtained_at cannot be in the future"}), 400
            record.obtained_at = obtained_at

        if 'reimbursement_amount' in data:
            amount = data.get('reimbursement_amount')
            if amount and float(amount) < 0:
                return jsonify({"error": "reimbursement_amount must be >= 0"}), 400
            record.reimbursement_amount = amount

        if 'paid_with_own_resources' in data: record.paid_with_own_resources = data.get('paid_with_own_resources')
        if 'reimbursement_registered' in data: record.reimbursement_registered = data.get('reimbursement_registered')
        if 'reimbursement_registered_at' in data: 
            record.reimbursement_registered_at = datetime.fromisoformat(data.get('reimbursement_registered_at')) if data.get('reimbursement_registered_at') else None
        if 'notes' in data: record.notes = data.get('notes')

        db.session.commit()
        return jsonify(record.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Record with this consultant, certification and date already exists"}), 409
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultant_certifications_bp.route('/consultant-certifications/<int:id>', methods=['DELETE'])
def delete_consultant_certification(id):
    record = ConsultantCertification.query.get_or_404(id)
    try:
        db.session.delete(record)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
