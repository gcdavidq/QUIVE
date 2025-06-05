from marshmallow import Schema, fields, validate

class TrackingPostSchema(Schema):
    id_asignacion = fields.Integer(required=True)
    latitud = fields.Float(required=True)
    longitud = fields.Float(required=True)
    hora_ultima_actualizacion = fields.DateTime(required=True, format="%Y-%m-%dT%H:%M:%S")
