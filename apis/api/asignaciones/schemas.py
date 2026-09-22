from marshmallow import Schema, fields, validate

class CrearAsignacionSchema(Schema):
    id_solicitud = fields.Integer(required=True)
    id_transportista = fields.Integer(required=True)
    # Se acepta por compatibilidad pero se ignora: el precio lo cotiza el servidor.
    precio = fields.Float(required=False, allow_none=True)


