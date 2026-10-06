from flask import Blueprint, jsonify, request
from database import db
from models.consultant import Consultant
from sqlalchemy.exc import IntegrityError

consultants_bp = Blueprint('consultants', __name__)

@consultants_bp.route('/consultants', methods=['GET'])
def get_consultants():
    consultants = Consultant.query.order_by(Consultant.id.asc()).all()
    return jsonify([c.to_dict() for c in consultants]), 200

@consultants_bp.route('/consultants/<int:id>', methods=['GET'])
def get_consultant(id):
    consultant = Consultant.query.get_or_404(id)
    return jsonify(consultant.to_dict()), 200

@consultants_bp.route('/consultants', methods=['POST'])
def create_consultant():
    data = request.get_json()
    
    # Validaciones mínimas
    if not data.get('full_name'):
        return jsonify({"error": "full_name is required"}), 400
    if data.get('participant_type') not in ['INTERNO', 'EXTERNO']:
        return jsonify({"error": "participant_type must be INTERNO or EXTERNO"}), 400
    if not data.get('team_number') or int(data.get('team_number')) <= 0:
        return jsonify({"error": "team_number must be > 0"}), 400

    try:
        new_consultant = Consultant(
            full_name=data.get('full_name'),
            participant_type=data.get('participant_type'),
            team_number=data.get('team_number'),
            consulting_firm_name=data.get('consulting_firm_name'),
            email=data.get('email'),
            teams_contact=data.get('teams_contact')
        )
        db.session.add(new_consultant)
        db.session.commit()
        return jsonify(new_consultant.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultants_bp.route('/consultants/<int:id>', methods=['PUT'])
def update_consultant(id):
    consultant = Consultant.query.get_or_404(id)
    data = request.get_json()

    if 'participant_type' in data and data.get('participant_type') not in ['INTERNO', 'EXTERNO']:
        return jsonify({"error": "participant_type must be INTERNO or EXTERNO"}), 400
    if 'team_number' in data and (not data.get('team_number') or int(data.get('team_number')) <= 0):
        return jsonify({"error": "team_number must be > 0"}), 400

    try:
        if 'full_name' in data: consultant.full_name = data.get('full_name')
        if 'participant_type' in data: consultant.participant_type = data.get('participant_type')
        if 'team_number' in data: consultant.team_number = data.get('team_number')
        if 'consulting_firm_name' in data: consultant.consulting_firm_name = data.get('consulting_firm_name')
        if 'email' in data: consultant.email = data.get('email')
        if 'teams_contact' in data: consultant.teams_contact = data.get('teams_contact')
        
        db.session.commit()
        return jsonify(consultant.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultants_bp.route('/consultants/<int:id>', methods=['DELETE'])
def delete_consultant(id):
    consultant = Consultant.query.get_or_404(id)
    try:
        db.session.delete(consultant)
        db.session.commit()
        return '', 204
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Cannot delete consultant due to existing related records"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
