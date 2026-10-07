import pytest
from tests.helpers import api_team_id
from datetime import date

def test_create_consultant_certification(client):
    # First create a consultant and a certification to link
    consultant_payload = {
        "full_name": "Consultant Cert",
        "participant_type": "INTERNO",
        "team_id": api_team_id(client),
        "email": "cert@example.com",
        "teams_contact": "cert"
    }
    consultant_res = client.post('/api/consultants', json=consultant_payload)
    consultant_id = consultant_res.get_json()['id']
    
    cert_type_payload = {
        "name": "Cloud Type",
        "code": "CLD123",
        "category": "TECHNICAL"
    }
    cert_type_res = client.post('/api/certification-types', json=cert_type_payload)
    if cert_type_res.status_code != 201:
        print("CERT TYPE ERROR:", cert_type_res.get_json())
    cert_type_id = cert_type_res.get_json()['id']
    
    certification_payload = {
        "name": "AWS Certified",
        "certification_type_id": cert_type_id,
        "vendor": "AWS",
        "level": "Associate",
        "is_active": True
    }
    certification_res = client.post('/api/certifications', json=certification_payload)
    certification_id = certification_res.get_json()['id']
    
    # Now create the consultant certification
    payload = {
        "consultant_id": consultant_id,
        "certification_id": certification_id,
        "obtained_at": "2026-03-01",
        "reimbursement_amount": "150.00",
        "paid_with_own_resources": True,
        "notes": "Good"
    }
    response = client.post('/api/consultant-certifications', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['consultant_id'] == consultant_id
    assert data['certification_id'] == certification_id
    assert data['obtained_at'] == "2026-03-01"
    assert float(data['reimbursement_amount']) == 150.0

def test_get_consultant_certifications(client):
    response = client.get('/api/consultant-certifications')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ---- Fechas: una certificación no puede haberse obtenido en el futuro ----
import uuid
from datetime import date as _date, timedelta


def _setup_cert(client):
    u = uuid.uuid4().hex[:8]
    consultant_id = client.post('/api/consultants', json={
        "full_name": f"Fecha {u}", "participant_type": "INTERNO", "team_id": api_team_id(client)
    }).get_json()['id']
    type_id = client.post('/api/certification-types', json={"code": f"TF{u}", "points_base": 10}).get_json()['id']
    cert_id = client.post('/api/certifications', json={
        "vendor": "V", "name": f"Cert {u}", "certification_type_id": type_id}).get_json()['id']
    return consultant_id, cert_id


def test_future_obtained_date_is_rejected(client):
    consultant_id, cert_id = _setup_cert(client)
    tomorrow = (_date.today() + timedelta(days=1)).isoformat()
    response = client.post('/api/consultant-certifications', json={
        "consultant_id": consultant_id, "certification_id": cert_id, "obtained_at": tomorrow})
    assert response.status_code == 400
    assert "future" in response.get_json()['error']
    # y no quedó registrada
    assert [c for c in client.get('/api/consultant-certifications').get_json() if c['consultant_id'] == consultant_id] == []


def test_today_and_past_dates_are_accepted(client):
    consultant_id, cert_id = _setup_cert(client)
    today = _date.today().isoformat()
    assert client.post('/api/consultant-certifications', json={
        "consultant_id": consultant_id, "certification_id": cert_id, "obtained_at": today}).status_code == 201


def test_cannot_move_an_existing_certification_to_the_future(client):
    consultant_id, cert_id = _setup_cert(client)
    record = client.post('/api/consultant-certifications', json={
        "consultant_id": consultant_id, "certification_id": cert_id, "obtained_at": "2026-01-15"}).get_json()
    tomorrow = (_date.today() + timedelta(days=1)).isoformat()
    response = client.put(f"/api/consultant-certifications/{record['id']}", json={"obtained_at": tomorrow})
    assert response.status_code == 400
    assert client.get(f"/api/consultant-certifications/{record['id']}").get_json()['obtained_at'] == "2026-01-15"
