from database import db
from models.team import Team


def default_team_id():
    """Id de un equipo de prueba (se crea una sola vez). Requiere un app context activo."""
    team = Team.query.filter_by(name='Equipo Test').first()
    if not team:
        team = Team(name='Equipo Test')
        db.session.add(team)
        db.session.commit()
    return team.id


def api_team_id(client):
    """Igual que default_team_id pero usando la API (para tests que sólo usan `client`)."""
    resp = client.post('/api/teams', json={'name': 'Equipo Test'})
    if resp.status_code == 201:
        return resp.get_json()['id']
    return next(t['id'] for t in client.get('/api/teams').get_json() if t['name'] == 'Equipo Test')
