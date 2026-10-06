import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Cargar variables desde .env si existe (solo para desarrollo local)
load_dotenv()

class Config:
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
