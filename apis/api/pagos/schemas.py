from marshmallow import Schema, fields, validate

class CrearPagoMinSchema(Schema):
    id_asignacion = fields.Int(required=True)
    receptor_id = fields.Int(required=True)

class UpdatePagoSchema(Schema):
    monto_total = fields.Float(required=False)
    pagador_id = fields.Int(required=False)
    tipo_metodo = fields.Str(
        required=False,
        validate=validate.OneOf(['Tarjeta', 'Yape', 'PayPal'])
    )
