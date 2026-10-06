from flask import Blueprint, jsonify, current_app
from sqlalchemy import text, inspect
from database import db
from models.certification_type import CertificationType
from models.extra_point_reason_type import ExtraPointReasonType

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "rally-back"
    })

@health_bp.route('/health/db', methods=['GET'])
def health_db():
    if not current_app.config.get('SQLALCHEMY_DATABASE_URI'):
        return jsonify({
            "status": "error",
            "database": "not_configured",
            "message": "Database environment variables are missing"
        }), 500

    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({
            "status": "ok",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "database": "disconnected",
            "message": "Unable to connect to database"
        }), 500

@health_bp.route('/health/schema', methods=['GET'])
def health_schema():
    try:
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            "consultants",
            "certification_types",
            "certifications",
            "consultant_certifications",
            "course_sessions",
            "course_attendances",
            "extra_point_reason_types",
            "consultant_extra_points"
        ]
        
        # Verificar si todas las tablas esperadas están presentes
        missing_tables = [t for t in expected_tables if t not in tables]
        
        return jsonify({
            "status": "ok" if not missing_tables else "incomplete",
            "schema": "ready" if not missing_tables else "missing_tables",
            "tables": tables,
            "missing": missing_tables
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@health_bp.route('/health/catalogs', methods=['GET'])
def health_catalogs():
    try:
        cert_types_count = CertificationType.query.count()
        extra_point_reasons_count = ExtraPointReasonType.query.count()
        
        # Validación básica de que points_for_course existe en el primer registro si hay alguno
        first_cert = CertificationType.query.first()
        points_for_course_exists = hasattr(first_cert, 'points_for_course') if first_cert else False

        return jsonify({
            "status": "ok",
            "certification_types": cert_types_count,
            "extra_point_reason_types": extra_point_reasons_count,
            "points_for_course_detected": points_for_course_exists
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
