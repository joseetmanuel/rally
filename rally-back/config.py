import logging
import os
import secrets
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Cargar variables desde .env si existe (solo para desarrollo local)
load_dotenv()


# --- Perfil administrador (los valores reales viven en variables de entorno / Secret Manager) ---
ADMIN_USER = os.getenv('ADMIN_USER', 'Etmanuel')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')  # sin valor por defecto: si falta, el login queda deshabilitado
_secret_key = os.getenv('SECRET_KEY')
if not _secret_key:
    # Sin SECRET_KEY los tokens se firman con una clave aleatoria de este proceso: las sesiones de
    # administrador se pierden al reiniciar (y no valen entre varias instancias). Aceptable sólo en desarrollo.
    _secret_key = secrets.token_hex(32)
    logging.getLogger(__name__).warning('SECRET_KEY no está definida: se usa una clave temporal')


class Config:
    ADMIN_USER = ADMIN_USER
    ADMIN_PASSWORD = ADMIN_PASSWORD
    SECRET_KEY = _secret_key

    # Entorno y Puerto
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    PORT = int(os.getenv('PORT', 5000))
    
    # Lectura de variables individuales de base de datos
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME')
    
    # Construcción profesional de SQLALCHEMY_DATABASE_URI
    # No se usa fallback hardcodeado. Si faltan variables críticas, será None.
    if all([db_user, db_password, db_host, db_name]):
        # Se aplica quote_plus al password para evitar problemas con caracteres especiales como '*'
        encoded_password = quote_plus(db_password)
        SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"
    else:
        SQLALCHEMY_DATABASE_URI = None
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
