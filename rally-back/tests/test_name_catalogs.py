import uuid

import pytest

from tests.helpers import api_team_id

# Equipos y consultoras comparten el mismo comportamiento (catálogo de un solo campo `name`)
CATALOGS = ['teams', 'consulting-firms']


def unique(prefix):
    return f"{prefix} {uuid.uuid4().hex[:8]}"


@pytest.mark.parametrize('url', CATALOGS)
def test_crud(client, url):
    created = client.post(f'/api/{url}', json={"name": unique("Item")})
    assert created.status_code == 201
    item = created.get_json()

    assert client.get(f'/api/{url}/{item["id"]}').get_json() == item
    assert item in client.get(f'/api/{url}').get_json()

    renamed = client.put(f'/api/{url}/{item["id"]}', json={"name": unique("Renombrado")})
    assert renamed.status_code == 200
    assert renamed.get_json()['name'].startswith("Renombrado")

    assert client.delete(f'/api/{url}/{item["id"]}').status_code == 204
    assert client.get(f'/api/{url}/{item["id"]}').status_code == 404


@pytest.mark.parametrize('url', CATALOGS)
def test_name_is_required_and_trimmed(client, url):
    assert client.post(f'/api/{url}', json={}).status_code == 400
    assert client.post(f'/api/{url}', json={"name": "   "}).status_code == 400
    name = unique("Trim")
    assert client.post(f'/api/{url}', json={"name": f"  {name}  "}).get_json()['name'] == name


@pytest.mark.parametrize('url', CATALOGS)
def test_duplicate_name_is_rejected(client, url):
    name = unique("Dup")
    assert client.post(f'/api/{url}', json={"name": name}).status_code == 201
    assert client.post(f'/api/{url}', json={"name": name}).status_code == 409
    other = client.post(f'/api/{url}', json={"name": unique("Otro")}).get_json()
    assert client.put(f'/api/{url}/{other["id"]}', json={"name": name}).status_code == 409


@pytest.mark.parametrize('url', CATALOGS)
def test_list_is_sorted_by_name(client, url):
    # Se insertan en orden inverso; el orden exacto depende de la intercalación de PostgreSQL,
    # por eso sólo se afirma lo que es válido en cualquier intercalación: Alfa va antes que Zeta.
    zeta = client.post(f'/api/{url}', json={"name": f"Zeta {uuid.uuid4().hex[:6]}"}).get_json()['id']
    alfa = client.post(f'/api/{url}', json={"name": f"Alfa {uuid.uuid4().hex[:6]}"}).get_json()['id']
    ids = [i['id'] for i in client.get(f'/api/{url}').get_json()]
    assert ids.index(alfa) < ids.index(zeta)


def test_team_in_use_cannot_be_deleted(client):
    team_id = api_team_id(client)
    client.post('/api/consultants', json={"full_name": "Usa equipo", "participant_type": "INTERNO", "team_id": team_id})
    assert client.delete(f'/api/teams/{team_id}').status_code == 409


def test_firm_in_use_cannot_be_deleted(client):
    firm_id = client.post('/api/consulting-firms', json={"name": unique("EnUso")}).get_json()['id']
    client.post('/api/consultants', json={
        "full_name": "Usa firma", "participant_type": "EXTERNO",
        "team_id": api_team_id(client), "consulting_firm_id": firm_id})
    assert client.delete(f'/api/consulting-firms/{firm_id}').status_code == 409
