
from marshmallow import Schema, fields, validate

class MetodoPagoSchema(Schema):
    tipo = fields.String(required=True, validate=validate.OneOf(["Tarjeta", "Yape", "PayPal"]))
    datos = fields.Dict(required=True)

class ActualizarMetodoSchema(Schema):
    tipo = fields.String(required=True, validate=validate.OneOf(["Tarjeta", "Yape", "PayPal"]))
    datos = fields.Dict(required=True)

class PagoSchema(Schema):
    usuario_id_origen = fields.Integer(required=True)
    tipo_metodo = fields.String(required=True, validate=validate.OneOf(["Tarjeta", "Yape", "PayPal"]))
    id_metodo_externo = fields.Integer(required=True)
    destino_tipo = fields.String(required=True)  # "Yape", "PayPal", etc.
    destino_id = fields.Integer(required=True)
    monto = fields.Float(required=True)