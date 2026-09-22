from marshmallow import Schema, fields, validate, EXCLUDE

class TrackingPostSchema(Schema):
    class Meta:
        # La hora la pone el servidor; se ignora cualquier marca de tiempo enviada por el cliente.
        unknown = EXCLUDE

    id_asignacion = fields.Integer(required=True)
    latitud = fields.Float(required=True, validate=validate.Range(min=-90, max=90))
    longitud = fields.Float(required=True, validate=validate.Range(min=-180, max=180))
