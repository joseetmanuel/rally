from routes.health import health_bp
from routes.auth import auth_bp
from routes.consultants import consultants_bp
from routes.teams import teams_bp
from routes.consulting_firms import consulting_firms_bp
from routes.certification_types import certification_types_bp
from routes.certifications import certifications_bp
from routes.consultant_certifications import consultant_certifications_bp
from routes.course_sessions import course_sessions_bp
from routes.course_attendances import course_attendances_bp
from routes.extra_point_reason_types import extra_point_reason_types_bp
from routes.consultant_extra_points import consultant_extra_points_bp
from routes.ranking import ranking_bp

def register_routes(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(consultants_bp, url_prefix='/api')
    app.register_blueprint(teams_bp, url_prefix='/api')
    app.register_blueprint(consulting_firms_bp, url_prefix='/api')
    app.register_blueprint(certification_types_bp, url_prefix='/api')
    app.register_blueprint(certifications_bp, url_prefix='/api')
    app.register_blueprint(consultant_certifications_bp, url_prefix='/api')
    app.register_blueprint(course_sessions_bp, url_prefix='/api')
    app.register_blueprint(course_attendances_bp, url_prefix='/api')
    app.register_blueprint(extra_point_reason_types_bp, url_prefix='/api')
    app.register_blueprint(consultant_extra_points_bp, url_prefix='/api')
    app.register_blueprint(ranking_bp, url_prefix='/api')
