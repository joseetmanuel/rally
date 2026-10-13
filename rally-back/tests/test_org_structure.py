"""Estructura jerárquica CTO > Dirección > Subdirección > Gerencia > participantes."""
import uuid

import pytest

from database import db
from models.consultant import Consultant
from models.org_structure import Cto, Direction, Management, Subdirection
from tests.helpers import api_team_id

LEVEL_URLS = ['ctos', 'directions', 'subdirections', 'managements']


def u():
    return uuid.uuid4().hex[:8]


def make_chain(client, tag=None):
    """Crea CTO > Dirección > Subdirección > Gerencia por la API y devuelve los cuatro registros."""
    tag = tag or u()
    cto = client.post('/api/ctos', json={'name': f'CTO {tag}', 'head_name': f'Jefe CTO {tag}'}).get_json()
    direction = client.post('/api/directions', json={'name': f'Dir {tag}', 'cto_id': cto['id']}).get_json()
    sub = client.post('/api/subdirections', json={'name': f'Sub {tag}', 'direction_id': direction['id']}).get_json()
    mgmt = client.post('/api/managements', json={'name': f'Ger {tag}', 'subdirection_id': sub['id']}).get_json()
    return cto, direction, sub, mgmt


def make_consultant(client, management_id=None, name=None):
    payload = {'full_name': name or f'Persona {u()}', 'participant_type': 'INTERNO', 'team_id': api_team_id(client)}
    if management_id is not None:
        payload['management_id'] = management_id
    response = client.post('/api/consultants', json=payload)
    assert response.status_code == 201, response.get_json()
    return response.get_json()


# ------------------------------------------------------------------ CRUD y validaciones
def test_create_the_whole_chain_and_read_it_back(client):
    cto, direction, sub, mgmt = make_chain(client)
    assert direction['cto_id'] == cto['id']
    assert sub['direction_id'] == direction['id'] and sub['cto_id'] == cto['id']
    assert mgmt['subdirection_id'] == sub['id']
    assert mgmt['direction_id'] == direction['id'] and mgmt['cto_id'] == cto['id']
    assert client.get(f"/api/managements/{mgmt['id']}").get_json()['name'] == mgmt['name']
    assert cto['head_name'].startswith('Jefe CTO')


@pytest.mark.parametrize('url,parent', [('directions', 'cto_id'), ('subdirections', 'direction_id'),
                                        ('managements', 'subdirection_id')])
def test_a_level_needs_its_parent_and_the_parent_must_exist(client, url, parent):
    assert client.post(f'/api/{url}', json={'name': 'Sin padre'}).status_code == 400
    assert client.post(f'/api/{url}', json={'name': 'Padre falso', parent: 99999999}).status_code == 400
    assert client.post(f'/api/{url}', json={'name': 'Padre texto', parent: 'uno'}).status_code == 400


@pytest.mark.parametrize('url', LEVEL_URLS)
def test_name_is_required(client, url):
    cto = client.post('/api/ctos', json={'name': f'CTO {u()}'}).get_json()
    payload = {'name': '   ', 'cto_id': cto['id']}
    assert client.post(f'/api/{url}', json=payload).status_code == 400


def test_names_and_heads_are_editable_by_id(client):
    cto, direction, sub, mgmt = make_chain(client)
    changed = client.put(f"/api/directions/{direction['id']}", json={'name': 'Core Nuevo', 'head_name': 'Karla Nueva'})
    assert changed.status_code == 200
    assert changed.get_json()['name'] == 'Core Nuevo' and changed.get_json()['head_name'] == 'Karla Nueva'
    # editar sólo un campo no toca el otro
    only_head = client.put(f"/api/directions/{direction['id']}", json={'head_name': 'Otra'}).get_json()
    assert only_head['name'] == 'Core Nuevo' and only_head['head_name'] == 'Otra'
    assert client.put(f"/api/directions/{direction['id']}", json={'name': ''}).status_code == 400
    assert client.put('/api/directions/99999999', json={'name': 'x'}).status_code == 404


def test_same_name_twice_under_the_same_parent_is_rejected_but_not_under_another(client):
    cto_a, _, _, _ = make_chain(client)
    cto_b = client.post('/api/ctos', json={'name': f'CTO {u()}'}).get_json()
    first = client.post('/api/directions', json={'name': 'Core', 'cto_id': cto_a['id']})
    assert first.status_code == 201
    assert client.post('/api/directions', json={'name': 'Core', 'cto_id': cto_a['id']}).status_code == 409
    assert client.post('/api/directions', json={'name': 'Core', 'cto_id': cto_b['id']}).status_code == 201
    # renombrar para chocar también se rechaza
    other = client.post('/api/directions', json={'name': 'Otra', 'cto_id': cto_a['id']}).get_json()
    assert client.put(f"/api/directions/{other['id']}", json={'name': 'Core'}).status_code == 409


def test_a_head_can_be_linked_to_a_participant_who_exists(client):
    _, _, sub, _ = make_chain(client)
    person = make_consultant(client)
    linked = client.put(f"/api/subdirections/{sub['id']}", json={'head_consultant_id': person['id']})
    assert linked.status_code == 200 and linked.get_json()['head_consultant_id'] == person['id']
    assert client.put(f"/api/subdirections/{sub['id']}", json={'head_consultant_id': 99999999}).status_code == 400
    unlinked = client.put(f"/api/subdirections/{sub['id']}", json={'head_consultant_id': None})
    assert unlinked.get_json()['head_consultant_id'] is None


@pytest.mark.parametrize('url', LEVEL_URLS)
def test_structure_levels_cannot_be_deleted(client, url):
    cto, _, _, _ = make_chain(client)
    assert client.delete(f"/api/{url}/{cto['id']}").status_code == 405


def test_a_unit_can_move_to_another_parent(client):
    _, direction_a, sub, _ = make_chain(client)
    _, direction_b, _, _ = make_chain(client)
    moved = client.put(f"/api/subdirections/{sub['id']}", json={'direction_id': direction_b['id']}).get_json()
    assert moved['direction_id'] == direction_b['id'] and moved['cto_id'] == direction_b['cto_id']
    assert direction_a['id'] != direction_b['id']


# ------------------------------------------------------------------ árbol
def test_the_tree_nests_every_level_and_counts_participants(client):
    cto, direction, sub, mgmt = make_chain(client)
    make_consultant(client, mgmt['id'])
    make_consultant(client, mgmt['id'])
    tree = client.get('/api/org-structure').get_json()
    node_cto = next(c for c in tree if c['id'] == cto['id'])
    node_dir = next(d for d in node_cto['directions'] if d['id'] == direction['id'])
    node_sub = next(s for s in node_dir['subdirections'] if s['id'] == sub['id'])
    node_mgmt = next(m for m in node_sub['managements'] if m['id'] == mgmt['id'])
    assert node_mgmt['participants'] == 2


# ------------------------------------------------------------------ permisos
@pytest.mark.parametrize('path', ['/api/ctos', '/api/directions', '/api/subdirections', '/api/managements',
                                  '/api/org-structure', '/api/ctos/1', '/api/managements/1'])
def test_public_cannot_read_the_structure(public_client, path):
    response = public_client.get(path)
    assert response.status_code == 401 and response.get_json()['code'] == 'auth_required', path


@pytest.mark.parametrize('url', LEVEL_URLS)
def test_public_cannot_write_the_structure(public_client, url):
    assert public_client.post(f'/api/{url}', json={'name': 'x', 'cto_id': 1}).status_code == 401
    assert public_client.put(f'/api/{url}/1', json={'name': 'x'}).status_code == 401


# ------------------------------------------------------------------ participantes
def test_a_participant_belongs_to_a_management_and_knows_its_whole_chain(client):
    cto, direction, sub, mgmt = make_chain(client)
    person = make_consultant(client, mgmt['id'])
    assert person['management_id'] == mgmt['id']
    assert (person['subdirection_id'], person['direction_id'], person['cto_id']) == (
        sub['id'], direction['id'], cto['id'])


def test_the_management_is_optional_in_the_api_but_must_exist_when_sent(client):
    assert make_consultant(client)['management_id'] is None
    bad = client.post('/api/consultants', json={
        'full_name': f'X {u()}', 'participant_type': 'INTERNO', 'team_id': api_team_id(client), 'management_id': 99999999})
    assert bad.status_code == 400


def test_a_participant_can_change_management(client):
    _, _, _, mgmt_a = make_chain(client)
    _, _, _, mgmt_b = make_chain(client)
    person = make_consultant(client, mgmt_a['id'])
    moved = client.put(f"/api/consultants/{person['id']}", json={'management_id': mgmt_b['id']})
    assert moved.status_code == 200 and moved.get_json()['management_id'] == mgmt_b['id']
    assert client.put(f"/api/consultants/{person['id']}", json={'management_id': 99999999}).status_code == 400
    cleared = client.put(f"/api/consultants/{person['id']}", json={'management_id': None}).get_json()
    assert cleared['management_id'] is None and cleared['subdirection_id'] is None


def test_the_public_never_receives_the_consultants_endpoint(public_client):
    assert public_client.get('/api/consultants').status_code == 401


# ------------------------------------------------------------------ ranking por nivel
def _ids(ranking):
    return [r['consultant_id'] for r in ranking]


def test_admin_filters_the_ranking_by_each_level_and_positions_restart(client):
    cto_a, dir_a, sub_a, mgmt_a1 = make_chain(client)
    mgmt_a2 = client.post('/api/managements', json={'name': f'Ger2 {u()}', 'subdirection_id': sub_a['id']}).get_json()
    _, dir_b, sub_b, mgmt_b = make_chain(client)
    a1 = make_consultant(client, mgmt_a1['id'])
    a2 = make_consultant(client, mgmt_a2['id'])
    b1 = make_consultant(client, mgmt_b['id'])

    assert set(_ids(client.get(f"/api/ranking?management_id={mgmt_a1['id']}").get_json())) == {a1['id']}
    assert set(_ids(client.get(f"/api/ranking?subdirection_id={sub_a['id']}").get_json())) == {a1['id'], a2['id']}
    assert set(_ids(client.get(f"/api/ranking?direction_id={dir_a['id']}").get_json())) == {a1['id'], a2['id']}
    assert set(_ids(client.get(f"/api/ranking?cto_id={cto_a['id']}").get_json())) == {a1['id'], a2['id']}
    assert set(_ids(client.get(f"/api/ranking?subdirection_id={sub_b['id']}").get_json())) == {b1['id']}

    in_group = client.get(f"/api/ranking?subdirection_id={sub_a['id']}").get_json()
    assert [r['position'] for r in in_group] == [1, 2]  # posiciones dentro del grupo, no del total


def test_filters_combine_and_an_unknown_value_returns_nobody(client):
    _, dir_a, sub_a, mgmt_a = make_chain(client)
    _, _, sub_b, _ = make_chain(client)
    make_consultant(client, mgmt_a['id'])
    assert client.get(f"/api/ranking?direction_id={dir_a['id']}&subdirection_id={sub_b['id']}").get_json() == []
    assert client.get('/api/ranking?management_id=99999999').get_json() == []
    assert client.get('/api/ranking?management_id=abc').get_json() == []
    # filtro vacío = sin filtro
    assert len(client.get('/api/ranking?management_id=').get_json()) >= 1


def test_participants_without_management_never_appear_in_a_filtered_ranking(client):
    _, _, _, mgmt = make_chain(client)
    inside = make_consultant(client, mgmt['id'])
    outside = make_consultant(client)
    filtered = _ids(client.get(f"/api/ranking?management_id={mgmt['id']}").get_json())
    assert inside['id'] in filtered and outside['id'] not in filtered
    assert outside['id'] in _ids(client.get('/api/ranking').get_json())


def test_the_public_profile_ignores_the_filters_and_sees_everybody_mixed(public_client, client):
    _, _, sub, mgmt = make_chain(client)
    inside = make_consultant(client, mgmt['id'])
    outside = make_consultant(client)
    everybody = _ids(public_client.get('/api/ranking').get_json())
    filtered = _ids(public_client.get(f"/api/ranking?subdirection_id={sub['id']}&management_id={mgmt['id']}").get_json())
    assert filtered == everybody
    assert inside['id'] in filtered and outside['id'] in filtered


def test_the_pdf_detail_respects_the_filter_for_admin(client):
    _, _, _, mgmt = make_chain(client)
    inside = make_consultant(client, mgmt['id'])
    body = client.get(f"/api/ranking?detail=1&management_id={mgmt['id']}").get_json()
    assert _ids(body) == [inside['id']] and 'entries' in body[0]


# ------------------------------------------------------------------ semilla
def _wipe_structure():
    Consultant.query.update({'management_id': None})
    for model in (Management, Subdirection, Direction, Cto):
        model.query.delete()
    db.session.commit()


def test_seed_creates_the_initial_structure_once_and_assigns_existing_participants(app, client):
    from seed import seed_org_structure
    person = make_consultant(client)
    with app.app_context():
        _wipe_structure()
        seed_org_structure()
        db.session.commit()
        assert [c.name for c in Cto.query.all()] == ['Tecnología']
        assert Cto.query.one().head_name == 'Óscar'
        direction = Direction.query.one()
        assert (direction.name, direction.head_name) == ('Core Bancario', 'Karla')
        sub = Subdirection.query.one()
        assert (sub.name, sub.head_name) == ('Ingeniería de Software', 'Teodoro')
        management = Management.query.one()
        assert Consultant.query.get(person['id']).management_id == management.id

        # segunda ejecución: no duplica ni pisa lo editado desde la pantalla de administración
        Cto.query.one().head_name = 'Editado'
        db.session.commit()
        seed_org_structure()
        db.session.commit()
        assert Cto.query.count() == 1 and Cto.query.one().head_name == 'Editado'
        _wipe_structure()
