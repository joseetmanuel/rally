from models.consulting_firm import ConsultingFirm
from models.consultant import Consultant
from routes.name_catalog import make_name_catalog_blueprint

consulting_firms_bp = make_name_catalog_blueprint(
    'consulting_firms', 'consulting-firms', ConsultingFirm,
    [(Consultant, Consultant.consulting_firm_id)])
