import pytest

def test_create_consultant(client):
    """Validar creación de un consultor."""
    payload = {
        "full_name": "Juan Test",
        "participant_type": "INTERNO",
        "team_number": 1,
        "email": "juan.test@example.com",
        "teams_contact": "juan.test"
    }
    response = client.post('/api/consultants', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['full_name'] == payload['full_name']
    assert data['id'] is not None

def test_get_consultants(client):
    """Validar listado de consultores."""
    # Crear uno primero
    client.post('/api/consultants', json={
        "full_name": "Consultor Lista",
        "participant_type": "EXTERNO",
        "team_number": 2,
        "consulting_firm_name": "Firma Test"
    })
    
    response = client.get('/api/consultants')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_consultant_by_id(client):
    """Validar obtener un consultor por ID."""
    payload = {"full_name": "Consultor Individual", "participant_type": "INTERNO", "team_number": 3}
    create_res = client.post('/api/consultants', json=payload)
    consultant_id = create_res.get_json()['id']
    
    response = client.get(f'/api/consultants/{consultant_id}')
    assert response.status_code == 200
    assert response.get_json()['full_name'] == payload['full_name']

def test_update_consultant(client):
    """Validar actualización de datos de un consultor."""
    create_res = client.post('/api/consultants', json={
        "full_name": "Original", "participant_type": "INTERNO", "team_number": 4
    })
    consultant_id = create_res.get_json()['id']
    
    update_payload = {"full_name": "Modificado", "team_number": 5}
    response = client.put(f'/api/consultants/{consultant_id}', json=update_payload)
    assert response.status_code == 200
    assert response.get_json()['full_name'] == "Modificado"
    assert response.get_json()['team_number'] == 5

def test_delete_consultant(client):
    """Validar eliminación de un consultor."""
    create_res = client.post('/api/consultants', json={
        "full_name": "AEliminar", "participant_type": "INTERNO", "team_number": 6
    })
    consultant_id = create_res.get_json()['id']
    
    del_response = client.delete(f'/api/consultants/{consultant_id}')
    assert del_response.status_code in [200, 204]
    
    get_response = client.get(f'/api/consultants/{consultant_id}')
    assert get_response.status_code == 404
