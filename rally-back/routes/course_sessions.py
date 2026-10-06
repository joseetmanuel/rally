from flask import Blueprint, jsonify, request
from database import db
from models.course_session import CourseSession
from models.certification import Certification
from models.consultant import Consultant
from sqlalchemy.exc import IntegrityError
from datetime import datetime

course_sessions_bp = Blueprint('course_sessions', __name__)

@course_sessions_bp.route('/course-sessions', methods=['GET'])
def get_course_sessions():
    sessions = CourseSession.query.order_by(CourseSession.id.asc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@course_sessions_bp.route('/course-sessions/<int:id>', methods=['GET'])
def get_course_session(id):
    session = CourseSession.query.get_or_404(id)
    return jsonify(session.to_dict()), 200

@course_sessions_bp.route('/course-sessions', methods=['POST'])
def create_course_session():
    data = request.get_json()
    
    cert_id = data.get('certification_id')
    instructor_id = data.get('instructor_consultant_id')
    session_date_str = data.get('session_date')

    if not cert_id or not instructor_id or not session_date_str:
        return jsonify({"error": "certification_id, instructor_consultant_id and session_date are required"}), 400

    if not Certification.query.get(cert_id):
        return jsonify({"error": "certification_id does not exist"}), 400
    if not Consultant.query.get(instructor_id):
        return jsonify({"error": "instructor_consultant_id does not exist"}), 400

    try:
        session_date = datetime.strptime(session_date_str, '%Y-%m-%d').date()
        new_session = CourseSession(
            certification_id=cert_id,
            instructor_consultant_id=instructor_id,
            session_date=session_date,
            title=data.get('title'),
            notes=data.get('notes')
        )
        db.session.add(new_session)
        db.session.commit()
        return jsonify(new_session.to_dict()), 201
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@course_sessions_bp.route('/course-sessions/<int:id>', methods=['PUT'])
def update_course_session(id):
    session = CourseSession.query.get_or_404(id)
    data = request.get_json()

    try:
        if 'certification_id' in data:
            if not Certification.query.get(data.get('certification_id')):
                return jsonify({"error": "certification_id does not exist"}), 400
            session.certification_id = data.get('certification_id')
        
        if 'instructor_consultant_id' in data:
            if not Consultant.query.get(data.get('instructor_consultant_id')):
                return jsonify({"error": "instructor_consultant_id does not exist"}), 400
            session.instructor_consultant_id = data.get('instructor_consultant_id')

        if 'session_date' in data:
            session.session_date = datetime.strptime(data.get('session_date'), '%Y-%m-%d').date()

        if 'title' in data: session.title = data.get('title')
        if 'notes' in data: session.notes = data.get('notes')

        db.session.commit()
        return jsonify(session.to_dict()), 200
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@course_sessions_bp.route('/course-sessions/<int:id>', methods=['DELETE'])
def delete_course_session(id):
    session = CourseSession.query.get_or_404(id)
    try:
        db.session.delete(session)
        db.session.commit()
        return '', 204
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Cannot delete session due to existing attendance records"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
