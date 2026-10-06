import os
from flask import Flask, request
from flask_migrate import Migrate
from config import Config
from database import db
from routes import register_routes

# Importar modelos para que Flask-Migrate los detecte
import models.consultant
import models.certification_type
import models.certification
import models.consultant_certification
import models.course_session
import models.course_attendance
import models.extra_point_reason_type
import models.consultant_extra_point

def create_app(config_object=Config):
    app = Flask(__name__)
    
    # 1. Cargar configuración desde el objeto Config
    app.config.from_object(config_object)

    # 2. Inicializar extensiones
    db.init_app(app)
    # Inicializar Flask-Migrate
    Migrate(app, db)

    # 3. Registrar rutas
    register_routes(app)

    # 4. CORS: el navegador exige estas cabeceras para que Angular (otro origen) llame a la API
    allowed_origins = {
        o.strip() for o in os.getenv('CORS_ORIGINS', 'http://localhost:4200').split(',') if o.strip()
    }

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin')
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Vary'] = 'Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = request.headers.get(
                'Access-Control-Request-Headers', 'Content-Type')
        return response

    return app

app = create_app()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0', 
        port=app.config.get('PORT', 5000), 
        debug=app.config.get('FLASK_ENV') == 'development'
    )
