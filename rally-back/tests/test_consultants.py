import uuid

from tests.helpers import api_team_id


def new_firm(client, name=None):
    name = name or f"Firma {uuid.uuid4().hex[:8]}"
    return client.post('/api/consulting-firms', json={"name": name}).get_json()['id']


def test_create_consultant(client):
    """Validar creación de un consultor con su equipo."""
    team_id = api_team_id(client)
    payload = {
        "full_name": "Juan Test",
        "participant_type": "INTERNO",
        "team_id": team_id,
        "email": "juan.test@example.com",
        "teams_contact": "juan.test"
    }
    response = client.post('/api/consultants', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['full_name'] == payload['full_name']
    assert data['id'] is not None
    assert data['team'] == {"id": team_id, "name": "Equipo Test"}
    assert data['consulting_firm'] is None


def test_create_external_consultant_with_firm(client):
    firm_name = f"Firma Externa {uuid.uuid4().hex[:6]}"
    firm_id = new_firm(client, firm_name)
    response = client.post('/api/consultants', json={
        "full_name": "Externo", "participant_type": "EXTERNO",
        "team_id": api_team_id(client), "consulting_firm_id": firm_id
    })
    assert response.status_code == 201
    assert response.get_json()['consulting_firm'] == {"id": firm_id, "name": firm_name}


def test_team_is_required_and_must_exist(client):
    base = {"full_name": "Sin equipo", "participant_type": "INTERNO"}
    assert client.post('/api/consultants', json=base).status_code == 400
    assert client.post('/api/consultants', json={**base, "team_id": 999999}).status_code == 400


def test_firm_only_for_external_and_must_exist(client):
    team_id = api_team_id(client)
    firm_id = new_firm(client)
    internal = client.post('/api/consultants', json={
        "full_name": "Interno con firma", "participant_type": "INTERNO",
        "team_id": team_id, "consulting_firm_id": firm_id})
    assert internal.status_code == 400
    missing = client.post('/api/consultants', json={
        "full_name": "Externo", "participant_type": "EXTERNO",
        "team_id": team_id, "consulting_firm_id": 999999})
    assert missing.status_code == 400


def test_get_consultants(client):
    """Validar listado de consultores."""
    client.post('/api/consultants', json={
        "full_name": "Consultor Lista",
        "participant_type": "EXTERNO",
        "team_id": api_team_id(client),
        "consulting_firm_id": new_firm(client)
    })
    response = client.get('/api/consultants')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_consultant_by_id(client):
    """Validar obtener un consultor por ID."""
    payload = {"full_name": "Consultor Individual", "participant_type": "INTERNO", "team_id": api_team_id(client)}
    consultant_id = client.post('/api/consultants', json=payload).get_json()['id']
    response = client.get(f'/api/consultants/{consultant_id}')
    assert response.status_code == 200
    assert response.get_json()['full_name'] == payload['full_name']


def test_update_consultant_team(client):
    """Validar actualización de datos y cambio de equipo."""
    team_id = api_team_id(client)
    other_team = client.post('/api/teams', json={"name": f"Otro {uuid.uuid4().hex[:6]}"}).get_json()['id']
    consultant_id = client.post('/api/consultants', json={
        "full_name": "Original", "participant_type": "INTERNO", "team_id": team_id
    }).get_json()['id']

    response = client.put(f'/api/consultants/{consultant_id}', json={"full_name": "Modificado", "team_id": other_team})
    assert response.status_code == 200
    assert response.get_json()['full_name'] == "Modificado"
    assert response.get_json()['team_id'] == other_team


def test_changing_external_to_internal_requires_dropping_the_firm(client):
    team_id = api_team_id(client)
    consultant_id = client.post('/api/consultants', json={
        "full_name": "Cambia", "participant_type": "EXTERNO",
        "team_id": team_id, "consulting_firm_id": new_firm(client)
    }).get_json()['id']
    # Pasar a INTERNO conservando la consultora es inconsistente
    assert client.put(f'/api/consultants/{consultant_id}', json={"participant_type": "INTERNO"}).status_code == 400
    ok = client.put(f'/api/consultants/{consultant_id}',
                    json={"participant_type": "INTERNO", "consulting_firm_id": None})
    assert ok.status_code == 200
    assert ok.get_json()['consulting_firm'] is None


def test_delete_consultant(client):
    """Validar eliminación de un consultor."""
    consultant_id = client.post('/api/consultants', json={
        "full_name": "AEliminar", "participant_type": "INTERNO", "team_id": api_team_id(client)
    }).get_json()['id']
    del_response = client.delete(f'/api/consultants/{consultant_id}')
    assert del_response.status_code in [200, 204]
    assert client.get(f'/api/consultants/{consultant_id}').status_code == 404
