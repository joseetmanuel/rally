import pytest
from sqlalchemy.engine import make_url

from app import create_app
from config import Config, build_database_uri
from database import db


@pytest.fixture
def site(tmp_path):
    """App con un 'Angular compilado' de mentira en una carpeta temporal."""
    (tmp_path / 'assets').mkdir()
    (tmp_path / 'index.html').write_text('<html><body>RALLY-APP</body></html>', encoding='utf-8')
    (tmp_path / 'main-ABC123.js').write_text('console.log("main")', encoding='utf-8')
    (tmp_path / 'assets' / 'fondo.png').write_bytes(b'\x89PNG')

    class SiteConfig(Config):
        TESTING = True
        STATIC_DIR = str(tmp_path)
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    app = create_app(SiteConfig)
    with app.app_context():
        db.create_all()  # base SQLite en memoria propia: no toca la de desarrollo ni la de pruebas
    return app.test_client()


def test_root_serves_the_app_without_cache(site):
    response = site.get('/')
    assert response.status_code == 200 and b'RALLY-APP' in response.data
    assert response.headers['Cache-Control'] == 'no-cache'


def test_angular_routes_fall_back_to_the_app(site):
    for path in ('/app/home', '/auth/home', '/app/detail/40'):
        response = site.get(path)
        assert response.status_code == 200 and b'RALLY-APP' in response.data, path


def test_static_files_are_served_and_cached(site):
    js = site.get('/main-ABC123.js')
    assert js.status_code == 200 and js.data == b'console.log("main")'
    assert 'max-age' in js.headers['Cache-Control']
    assert site.get('/assets/fondo.png').data == b'\x89PNG'


def test_a_missing_file_is_a_real_404_not_the_app(site):
    assert site.get('/chunk-NOEXISTE.js').status_code == 404
    assert site.get('/assets/nada.png').status_code == 404


def test_unknown_api_paths_are_404_and_never_the_app(site):
    for path in ('/api/no-existe', '/api', '/health/otra-cosa'):
        response = site.get(path)
        assert response.status_code == 404 and b'RALLY-APP' not in response.data, path


def test_api_still_works_next_to_the_frontend(site):
    assert site.get('/health').status_code in (200, 404)  # la ruta existe o no, pero nunca es la app
    assert b'RALLY-APP' not in site.get('/api/ranking').data


def test_path_traversal_does_not_leave_the_static_folder(site):
    for path in ('/../config.py', '/..%2fconfig.py', '/assets/../../app.py', '/%2e%2e/app.py'):
        response = site.get(path)
        assert b'create_app' not in response.data and b'SECRET' not in response.data, path


def test_security_headers_on_every_response(site):
    for path in ('/', '/api/ranking', '/main-ABC123.js'):
        headers = site.get(path).headers
        assert headers['X-Content-Type-Options'] == 'nosniff'
        assert headers['X-Frame-Options'] == 'DENY'
        assert headers['Referrer-Policy'] == 'same-origin'


def test_hsts_only_over_https(site):
    assert 'Strict-Transport-Security' not in site.get('/').headers
    secure = site.get('/', headers={'X-Forwarded-Proto': 'https'})
    assert 'max-age=31536000' in secure.headers['Strict-Transport-Security']


def test_api_responses_are_never_cached(site):
    assert site.get('/api/ranking').headers['Cache-Control'] == 'no-store'


def test_without_a_frontend_folder_only_the_api_exists():
    class NoSite(Config):
        TESTING = True
        STATIC_DIR = '/no/existe'
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    client = create_app(NoSite).test_client()
    assert client.get('/').status_code == 404
    assert client.get('/app/home').status_code == 404


# ------------------------------------------------------------------ conexión a la base
def test_tcp_connection_uri():
    url = make_url(build_database_uri('postgres', 'p*ss word', 'localhost', '5432', 'rally_db'))
    assert (url.host, url.port, url.database, url.username) == ('localhost', 5432, 'rally_db', 'postgres')
    assert url.password == 'p*ss word'  # los caracteres especiales sobreviven al codificado


def test_cloud_sql_socket_uri():
    url = make_url(build_database_uri('rally', 'clave/rara:1', '/cloudsql/proyecto:us-east1:rally-db', '5432', 'rally_db'))
    assert url.host is None  # no hay host TCP
    assert url.query['host'] == '/cloudsql/proyecto:us-east1:rally-db'
    assert url.database == 'rally_db' and url.password == 'clave/rara:1'
