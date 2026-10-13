from flask import Blueprint, g, jsonify, request
from services.ranking_service import RankingService
from models.certification import Certification
from models.consultant import Consultant
from models.org_structure import Direction, Management, Subdirection
import rules

ranking_bp = Blueprint('ranking', __name__)


ORG_FILTERS = ('cto_id', 'direction_id', 'subdirection_id', 'management_id')


def _org_filter():
    """Ids de los participantes que cumplen los filtros de estructura (?cto_id= ?direction_id= ?subdirection_id=
    ?management_id=), o None si no hay filtro. Sólo el administrador puede filtrar: para el perfil público
    los parámetros se ignoran y ve el ranking completo."""
    if not getattr(g, 'is_admin', False):
        return None
    wanted = {}
    for key in ORG_FILTERS:
        raw = request.args.get(key)
        if raw not in (None, ''):
            wanted[key] = int(raw) if raw.isdigit() else -1  # un valor inválido no coincide con nadie
    if not wanted:
        return None
    query = (Consultant.query.join(Management, Consultant.management_id == Management.id)
             .join(Subdirection, Management.subdirection_id == Subdirection.id)
             .join(Direction, Subdirection.direction_id == Direction.id))
    columns = {'cto_id': Direction.cto_id, 'direction_id': Subdirection.direction_id,
               'subdirection_id': Management.subdirection_id, 'management_id': Management.id}
    for key, value in wanted.items():
        query = query.filter(columns[key] == value)
    return {c.id for c in query.all()}


@ranking_bp.route('/ranking', methods=['GET'])
def get_ranking():
    # ?detail=1 agrega a cada participante sus movimientos de puntos (lo usa el PDF)
    include_entries = request.args.get('detail', '').lower() in ('1', 'true', 'yes')
    return jsonify(RankingService.calculate_ranking(include_entries, _org_filter())), 200


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
