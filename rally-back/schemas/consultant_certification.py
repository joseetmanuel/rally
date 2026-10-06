from marshmallow import Schema, fields, validate, ValidationError

class ConsultantCertificationSchema(Schema):
    id = fields.Int(dump_only=True)
    consultant_id = fields.Int(required=True)
    certification_id = fields.Int(required=True)
    obtained_at = fields.Date(required=True)
    reimbursement_amount = fields.Decimal(as_string=True, allow_none=True)
    paid_with_own_resources = fields.Boolean(allow_none=True)
    reimbursement_registered = fields.Boolean(allow_none=True)
    reimbursement_registered_at = fields.DateTime(allow_none=True)
    notes = fields.String(allow_none=True)

consultant_certification_schema = ConsultantCertificationSchema()
consultant_certifications_schema = ConsultantCertificationSchema(many=True)
