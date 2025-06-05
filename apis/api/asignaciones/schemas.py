from marshmallow import Schema, fields, validate

class CrearAsignacionSchema(Schema):
    id_solicitud = fields.Integer(required=True)
    id_transportista = fields.Integer(required=True)

# No se necesitan más schemas específicos; el resto de endpoints
# no requieren payload (solo cambian estado según ruta).
