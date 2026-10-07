from flask import Blueprint, jsonify, request
import rules
from database import db
from models.consultant_extra_point import ConsultantExtraPoint
from models.consultant import Consultant
from models.extra_point_reason_type import ExtraPointReasonType
from models.course_session import CourseSession
from models.consultant_certification import ConsultantCertification
from sqlalchemy.exc import IntegrityError
from datetime import datetime

consultant_extra_points_bp = Blueprint('consultant_extra_points', __name__)

@consultant_extra_points_bp.route('/consultant-extra-points', methods=['GET'])
def get_consultant_extra_points():
    points = ConsultantExtraPoint.query.order_by(ConsultantExtraPoint.id.asc()).all()
    return jsonify([p.to_dict() for p in points]), 200

@consultant_extra_points_bp.route('/consultant-extra-points/<int:id>', methods=['GET'])
def get_consultant_extra_point(id):
    point = ConsultantExtraPoint.query.get_or_404(id)
    return jsonify(point.to_dict()), 200

@consultant_extra_points_bp.route('/consultant-extra-points', methods=['POST'])
def create_consultant_extra_point():
    data = request.get_json()
    
    consultant_id = data.get('consultant_id')
    reason_id = data.get('extra_point_reason_type_id')
    awarded_at_str = data.get('awarded_at')
    points = data.get('points')

    if not consultant_id or not reason_id or not awarded_at_str or points is None:
        return jsonify({"error": "consultant_id, extra_point_reason_type_id, awarded_at and points are required"}), 400

    if not Consultant.query.get(consultant_id):
        return jsonify({"error": "consultant_id does not exist"}), 400
    if not ExtraPointReasonType.query.get(reason_id):
        return jsonify({"error": "extra_point_reason_type_id does not exist"}), 400

    if int(points) < 0:
        return jsonify({"error": "points must be >= 0"}), 400

    # Optional FK checks
    if data.get('course_session_id') and not CourseSession.query.get(data.get('course_session_id')):
        return jsonify({"error": "course_session_id does not exist"}), 400
    if data.get('consultant_certification_id') and not ConsultantCertification.query.get(data.get('consultant_certification_id')):
        return jsonify({"error": "consultant_certification_id does not exist"}), 400

    try:
        awarded_at = datetime.fromisoformat(awarded_at_str)
        error = rules.window_error(awarded_at.date(), 'awarded_at')
        if error:
            return jsonify({"error": error}), 400
        new_point = ConsultantExtraPoint(
            consultant_id=consultant_id,
            extra_point_reason_type_id=reason_id,
            points=points,
            awarded_at=awarded_at,
            notes=data.get('notes'),
            course_session_id=data.get('course_session_id'),
            consultant_certification_id=data.get('consultant_certification_id')
        )
        db.session.add(new_point)
        db.session.commit()
        return jsonify(new_point.to_dict()), 201
    except ValueError:
        return jsonify({"error": "Invalid date format, use ISO 8601"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultant_extra_points_bp.route('/consultant-extra-points/<int:id>', methods=['PUT'])
def update_consultant_extra_point(id):
    point = ConsultantExtraPoint.query.get_or_404(id)
    data = request.get_json()

    try:
        if 'consultant_id' in data:
            if not Consultant.query.get(data.get('consultant_id')):
                return jsonify({"error": "consultant_id does not exist"}), 400
            point.consultant_id = data.get('consultant_id')
        
        if 'extra_point_reason_type_id' in data:
            if not ExtraPointReasonType.query.get(data.get('extra_point_reason_type_id')):
                return jsonify({"error": "extra_point_reason_type_id does not exist"}), 400
            point.extra_point_reason_type_id = data.get('extra_point_reason_type_id')

        if 'awarded_at' in data:
            new_awarded_at = datetime.fromisoformat(data.get('awarded_at'))
            error = rules.window_error(new_awarded_at.date(), 'awarded_at')
            if error:
                return jsonify({"error": error}), 400
            point.awarded_at = new_awarded_at

        if 'points' in data:
            points = data.get('points')
            if int(points) < 0:
                return jsonify({"error": "points must be >= 0"}), 400
            point.points = points

        if 'course_session_id' in data:
            if data.get('course_session_id') and not CourseSession.query.get(data.get('course_session_id')):
                return jsonify({"error": "course_session_id does not exist"}), 400
            point.course_session_id = data.get('course_session_id')

        if 'consultant_certification_id' in data:
            if data.get('consultant_certification_id') and not ConsultantCertification.query.get(data.get('consultant_certification_id')):
                return jsonify({"error": "consultant_certification_id does not exist"}), 400
            point.consultant_certification_id = data.get('consultant_certification_id')

        if 'notes' in data: point.notes = data.get('notes')

        db.session.commit()
        return jsonify(point.to_dict()), 200
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@consultant_extra_points_bp.route('/consultant-extra-points/<int:id>', methods=['DELETE'])
def delete_consultant_extra_point(id):
    point = ConsultantExtraPoint.query.get_or_404(id)
    try:
        db.session.delete(point)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
