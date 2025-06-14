from marshmallow import Schema, fields, validate

class CrearAsignacionSchema(Schema):
    id_solicitud = fields.Integer(required=True)
    id_transportista = fields.Integer(required=True)
    precio = fields.Float(required=True)


