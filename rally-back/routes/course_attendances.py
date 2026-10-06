from flask import Blueprint, jsonify, request
from database import db
from models.course_attendance import CourseAttendance
from models.course_session import CourseSession
from models.consultant import Consultant
from sqlalchemy.exc import IntegrityError

course_attendances_bp = Blueprint('course_attendances', __name__)

@course_attendances_bp.route('/course-attendances', methods=['GET'])
def get_course_attendances():
    attendances = CourseAttendance.query.order_by(CourseAttendance.id.asc()).all()
    return jsonify([a.to_dict() for a in attendances]), 200

@course_attendances_bp.route('/course-attendances/<int:id>', methods=['GET'])
def get_course_attendance(id):
    attendance = CourseAttendance.query.get_or_404(id)
    return jsonify(attendance.to_dict()), 200

@course_attendances_bp.route('/course-attendances', methods=['POST'])
def create_course_attendance():
    data = request.get_json()
    
    session_id = data.get('course_session_id')
    consultant_id = data.get('consultant_id')

    if not session_id or not consultant_id:
        return jsonify({"error": "course_session_id and consultant_id are required"}), 400

    session = CourseSession.query.get(session_id)
    if not session:
        return jsonify({"error": "course_session_id does not exist"}), 400
    if not Consultant.query.get(consultant_id):
        return jsonify({"error": "consultant_id does not exist"}), 400

    # Business rule: assistant cannot be instructor
    if session.instructor_consultant_id == consultant_id:
        return jsonify({"error": "The assistant cannot be the instructor of the session"}), 400

    try:
        new_attendance = CourseAttendance(
            course_session_id=session_id,
            consultant_id=consultant_id,
            points_obtained=data.get('points_obtained', 0),
            notes=data.get('notes')
        )
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify(new_attendance.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This consultant is already registered for this session"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@course_attendances_bp.route('/course-attendances/<int:id>', methods=['PUT'])
def update_course_attendance(id):
    attendance = CourseAttendance.query.get_or_404(id)
    data = request.get_json()

    try:
        if 'course_session_id' in data or 'consultant_id' in data:
            new_session_id = data.get('course_session_id', attendance.course_session_id)
            new_consultant_id = data.get('consultant_id', attendance.consultant_id)
            
            session = CourseSession.query.get(new_session_id)
            if not session:
                return jsonify({"error": "course_session_id does not exist"}), 400
            
            if session.instructor_consultant_id == new_consultant_id:
                return jsonify({"error": "The assistant cannot be the instructor of the session"}), 400
            
            attendance.course_session_id = new_session_id
            attendance.consultant_id = new_consultant_id

        if 'points_obtained' in data:
            points = data.get('points_obtained')
            if points and int(points) < 0:
                return jsonify({"error": "points_obtained must be >= 0"}), 400
            attendance.points_obtained = points
        
        if 'notes' in data: attendance.notes = data.get('notes')

        db.session.commit()
        return jsonify(attendance.to_dict()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This consultant is already registered for this session"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@course_attendances_bp.route('/course-attendances/<int:id>', methods=['DELETE'])
def delete_course_attendance(id):
    attendance = CourseAttendance.query.get_or_404(id)
    try:
        db.session.delete(attendance)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
