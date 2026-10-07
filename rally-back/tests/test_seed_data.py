from collections import Counter

from seed import CERTIFICATIONS, CONSULTING_FIRMS, TEAMS

TIPOS = {'FUNDACIONAL', 'PROFESIONAL', 'EXPERTO', 'OPCIONAL'}


def test_every_certification_uses_a_known_type():
    assert {tipo for _, _, tipo in CERTIFICATIONS} <= TIPOS


def test_certifications_are_unique_per_vendor():
    keys = [(vendor, name) for vendor, name, _ in CERTIFICATIONS]
    assert len(keys) == len(set(keys))


def test_catalog_matches_the_four_routes_of_the_rally_poster():
    por_proveedor = Counter(vendor for vendor, _, _ in CERTIFICATIONS)
    assert por_proveedor == {'AWS': 5, 'Microsoft': 6, 'Google Cloud': 6, 'Python Institute': 4}


def test_generative_ai_leader_is_on_the_gcp_route_as_foundational():
    assert ('Google Cloud', 'Generative AI Leader', 'FUNDACIONAL') in CERTIFICATIONS


def test_every_route_has_a_foundational_entry_point():
    for proveedor in ('AWS', 'Microsoft', 'Google Cloud', 'Python Institute'):
        assert any(v == proveedor and t == 'FUNDACIONAL' for v, _, t in CERTIFICATIONS)


def test_team_and_firm_catalogs_have_no_duplicates():
    assert len(TEAMS) == len(set(TEAMS))
    assert len(CONSULTING_FIRMS) == len(set(CONSULTING_FIRMS))
