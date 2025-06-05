from marshmallow import Schema, fields, validate

class CrearPagoSchema(Schema):
    id_asignacion = fields.Integer(required=True)
    monto_total = fields.Float(required=True)
    metodo_pago = fields.String(required=True, validate=validate.OneOf(["tarjeta", "Yape"]))
    id_metodo = fields.Integer(required=False)

class MetodoPagoSchema(Schema):
    tipo = fields.String(required=True, validate=validate.OneOf(["qr", "cci"]))
    entidad = fields.String(required=True)
    dato = fields.String(required=True)  # URL de QR o CCI
