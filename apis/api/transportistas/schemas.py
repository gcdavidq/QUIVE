from marshmallow import Schema, fields, validate

class DocumentosSchema(Schema):
    id_usuario = fields.String(required=True)
    licencia_conducir_url = fields.String(required=True)
    tarjeta_propiedad_url = fields.String(required=True)
    certificado_itv_url = fields.String(required=True)

class VerificacionSchema(Schema):
    estado_verificacion = fields.String(required=True, validate=validate.OneOf(["pendiente", "verificado", "rechazado"]))
    mensaje = fields.String(required=False)
