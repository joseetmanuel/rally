from flask import Blueprint, jsonify, request
from services.ranking_service import RankingService
from models.certification import Certification
import rules

ranking_bp = Blueprint('ranking', __name__)


@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    # ?detail=1 agrega a cada participante sus movimientos de puntos (lo usa el PDF)
    include_entries = request.args.get('detail', '').lower() in ('1', 'true', 'yes')
    return jsonify(RankingService.calculate_ranking(include_entries)), 200


@ranking_bp.route('/rules', methods=['GET'])
def get_rules():
    """Calendario del Rally: inicio, corte de puntos y la última fecha registrable hoy."""
    return jsonify(rules.describe()), 200


@ranking_bp.route('/rules/certifications', methods=['GET'])
def get_rules_certifications():
    """Certificaciones que cuentan en el Rally (las de la lámina) con su tipo y puntos, para la página de bases.
    Es una vista pública de sólo lectura: no incluye nada de personas."""
    certs = Certification.query.order_by(Certification.vendor, Certification.name).all()
    return jsonify([{
        'id': c.id,
        'vendor': c.vendor,
        'name': c.name,
        'type': c.certification_type.code,
        'points': c.certification_type.points_base,
    } for c in certs]), 200


@ranking_bp.route('/consultants/<int:id>/statement', methods=['GET'])
def get_statement(id):
    """Estado de cuenta: de dónde sale cada punto del participante, con saldo acumulado."""
    statement = RankingService.statement(id)
    if statement is None:
        return jsonify({"error": "consultant does not exist"}), 404
    return jsonify(statement), 200
