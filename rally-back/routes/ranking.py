from flask import Blueprint, jsonify
from services.ranking_service import RankingService

ranking_bp = Blueprint('ranking', __name__)


@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    return jsonify(RankingService.calculate_ranking()), 200
