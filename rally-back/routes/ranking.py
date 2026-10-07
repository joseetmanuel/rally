from flask import Blueprint, jsonify
from services.ranking_service import RankingService

ranking_bp = Blueprint('ranking', __name__)


@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    return jsonify(RankingService.calculate_ranking()), 200


@ranking_bp.route('/consultants/<int:id>/statement', methods=['GET'])
def get_statement(id):
    """Estado de cuenta: de dónde sale cada punto del participante, con saldo acumulado."""
    statement = RankingService.statement(id)
    if statement is None:
        return jsonify({"error": "consultant does not exist"}), 404
    return jsonify(statement), 200
