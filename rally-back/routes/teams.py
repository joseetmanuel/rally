from models.team import Team
from models.consultant import Consultant
from routes.name_catalog import make_name_catalog_blueprint

teams_bp = make_name_catalog_blueprint('teams', 'teams', Team, [(Consultant, Consultant.team_id)])
