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
        "obtained_at": "2023-10-01",
        "reimbursement_amount": "150.00",
        "paid_with_own_resources": True,
        "notes": "Good"
    }
    response = client.post('/api/consultant-certifications', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['consultant_id'] == consultant_id
    assert data['certification_id'] == certification_id
    assert data['obtained_at'] == "2023-10-01"
    assert float(data['reimbursement_amount']) == 150.0

def test_get_consultant_certifications(client):
    response = client.get('/api/consultant-certifications')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 1
