from flask import Blueprint, jsonify, request
from database import db
from models.consultant import Consultant
from models.team import Team
from models.consulting_firm import ConsultingFirm
from models.org_structure import Management
from sqlalchemy.exc import IntegrityError

consultants_bp = Blueprint('consultants', __name__)


def validate_management(management_id):
    """La gerencia es opcional en la API; si viene debe existir."""
    if management_id is not None and not db.session.get(Management, management_id):
        return "management_id does not exist"
    return None


def validate_catalogs(participant_type, team_id, firm_id):
    """Devuelve un mensaje de error si el equipo o la consultora no son válidos."""
    if not team_id or not db.session.get(Team, team_id):
        return "team_id is required and must exist"
    if firm_id is not None:
        if participant_type != 'EXTERNO':
            return "consulting_firm_id only applies to EXTERNO participants"
        if not db.session.get(ConsultingFirm, firm_id):
            return "consulting_firm_id does not exist"
    return None

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
    error = validate_catalogs(data.get('participant_type'), data.get('team_id'), data.get('consulting_firm_id')) \
        or validate_management(data.get('management_id'))
    if error:
        return jsonify({"error": error}), 400

    try:
        new_consultant = Consultant(
            full_name=data.get('full_name'),
            participant_type=data.get('participant_type'),
            team_id=data.get('team_id'),
            consulting_firm_id=data.get('consulting_firm_id'),
            management_id=data.get('management_id'),
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
    # Se valida con el estado resultante (lo enviado + lo que ya tenía el consultor)
    error = validate_catalogs(
        data.get('participant_type', consultant.participant_type),
        data.get('team_id', consultant.team_id),
        data.get('consulting_firm_id', consultant.consulting_firm_id)) \
        or (validate_management(data['management_id']) if 'management_id' in data else None)
    if error:
        return jsonify({"error": error}), 400

    try:
        if 'full_name' in data: consultant.full_name = data.get('full_name')
        if 'participant_type' in data: consultant.participant_type = data.get('participant_type')
        if 'team_id' in data: consultant.team_id = data.get('team_id')
        if 'consulting_firm_id' in data: consultant.consulting_firm_id = data.get('consulting_firm_id')
        if 'management_id' in data: consultant.management_id = data.get('management_id')
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
