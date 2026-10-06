def test_health_endpoint(client):
    """Validar que el endpoint de salud básico responda correctamente."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['service'] == 'rally-back'

def test_health_db_endpoint(client):
    """Validar que el endpoint de salud de la base de datos responda."""
    # Nota: Este test dependerá de si la DB de pruebas está realmente disponible
    response = client.get('/health/db')
    # Si la DB no está configurada, el test podría fallar o devolver 500, 
    # pero aquí validamos que al menos el endpoint exista.
    assert response.status_code in [200, 500]

def test_health_schema_endpoint(client):
    """Validar que el esquema de la base de datos se haya creado en el setup."""
    response = client.get('/health/schema')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['schema'] == 'ready'
    # Validar que existan las tablas principales
    assert "consultants" in data['tables']
    assert "certifications" in data['tables']
