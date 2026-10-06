import pytest
import os
import sys

# Asegurar que el directorio raíz del backend esté en el sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database import db
from config import Config

class TestConfig(Config):
    """Configuración específica para pruebas."""
    TESTING = True
    # Usar una base de datos de pruebas independiente
    db_name = os.getenv('DB_NAME_TEST', os.getenv('DB_NAME', 'rally_db') + '_test')
    
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT', '5432')
    
    if all([db_user, db_password, db_host, db_name]):
        from urllib.parse import quote_plus
        encoded_password = quote_plus(db_password if db_password else '')
        SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"
    else:
        # Fallback a SQLite en memoria si no hay variables de PostgreSQL
        SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

def _ensure_test_database():
    """Crea la base de pruebas en PostgreSQL si aún no existe."""
    if not TestConfig.SQLALCHEMY_DATABASE_URI.startswith('postgresql'):
        return
    import psycopg
    with psycopg.connect(
        host=TestConfig.db_host, port=TestConfig.db_port, user=TestConfig.db_user,
        password=TestConfig.db_password, dbname='postgres', autocommit=True
    ) as conn:
        exists = conn.execute('SELECT 1 FROM pg_database WHERE datname = %s', (TestConfig.db_name,)).fetchone()
        if not exists:
            conn.execute(f'CREATE DATABASE "{TestConfig.db_name}"')

@pytest.fixture(scope='session')
def app():
    """Fixture que inicializa la aplicación Flask para la sesión de pruebas."""
    _ensure_test_database()
    # La config de pruebas debe aplicarse al crear la app: el engine se crea en init_app
    app = create_app(TestConfig)

    # Guardia: drop_all() jamás debe tocar la base de desarrollo
    url = app.config['SQLALCHEMY_DATABASE_URI']
    assert url.startswith('sqlite') or url.rsplit('/', 1)[-1].endswith('_test'),         f'Las pruebas deben usar una base *_test, no: {url.rsplit("@", 1)[-1]}'

    with app.app_context():
        # Crear esquema de base de datos
        db.create_all()
        yield app
        # Limpieza final
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Fixture que provee un cliente de pruebas de Flask."""
    return app.test_client()

@pytest.fixture
def db_session(app):
    """Fixture para manejar una sesión de base de datos por prueba, con rollback automático."""
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        
        # Inyectar la conexión en la sesión de SQLAlchemy
        session = db.create_scoped_session(options={"bind": connection})
        db.session = session
        
        yield session
        
        transaction.rollback()
        connection.close()
        session.remove()
