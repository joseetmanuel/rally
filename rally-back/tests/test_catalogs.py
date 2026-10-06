import pytest

def test_create_certification_type(client):
    """Validar creación de tipo de certificación."""
    payload = {
        "code": "TEST_TYPE",
        "points_base": 50,
        "points_for_course": 10,
        "points_for_instructor": 5,
        "points_for_student": 2
    }
    response = client.post('/api/certification-types', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['code'] == "TEST_TYPE"
    assert data['points_base'] == 50

def test_get_certification_types(client):
    """Validar listado de tipos de certificación."""
    response = client.get('/api/certification-types')
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_create_certification(client):
    """Validar creación de una certificación asociada a un tipo."""
    # 1. Crear tipo primero
    type_res = client.post('/api/certification-types', json={
        "code": "VENDOR_TYPE", "points_base": 20
    })
    type_id = type_res.get_json()['id']
    
    # 2. Crear certificación
    payload = {
        "vendor": "Vendor Test",
        "name": "Cert Test 101",
        "certification_type_id": type_id
    }
    response = client.post('/api/certifications', json=payload)
    assert response.status_code == 201
    assert response.get_json()['name'] == "Cert Test 101"

def test_create_extra_point_reason(client):
    """Validar creación de motivo de puntos extra."""
    payload = {
        "code": "TEST_REASON",
        "name": "Reason Name",
        "description": "Some description"
    }
    response = client.post('/api/extra-point-reason-types', json=payload)
    assert response.status_code == 201
    assert response.get_json()['code'] == "TEST_REASON"
