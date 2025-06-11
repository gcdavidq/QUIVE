from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class CrearSolicitudSchema(Schema):
    id_usuario = fields.Int(required=True)
    origen = fields.String(required=True)
    destino = fields.String(required=True)
    tiempo_estimado = fields.Float(required=True)
    distancia = fields.Float(required=True)
    ruta = fields.String(required=True)
    fecha_hora = fields.DateTime(required=True, format="%Y-%m-%dT%H:%M:%S")


class ActualizarSolicitudSchema(Schema):
    fecha_hora = fields.DateTime(required=False, format="%Y-%m-%dT%H:%M:%S")
    cancelar = fields.Boolean(required=False)
