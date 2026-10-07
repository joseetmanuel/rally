from flask import Blueprint, jsonify, request
from services.ranking_service import RankingService
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


@ranking_bp.route('/consultants/<int:id>/statement', methods=['GET'])
def get_statement(id):
    """Estado de cuenta: de dónde sale cada punto del participante, con saldo acumulado."""
    statement = RankingService.statement(id)
    if statement is None:
        return jsonify({"error": "consultant does not exist"}), 404
    return jsonify(statement), 200
