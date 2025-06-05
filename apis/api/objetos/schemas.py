from marshmallow import Schema, fields, validate

class TipoObjetoSchema(Schema):
    categoria = fields.String(required=True)
    variante = fields.String(required=False)
    descripcion = fields.String(required=False)
    volumen_estimado = fields.Float(required=True)
    peso_estimado = fields.Float(required=True)
    es_fragil = fields.Boolean(required=False, missing=False)
    necesita_embalaje = fields.Boolean(required=False, missing=False)
    imagen_url = fields.Url(required=False)

class AddObjetoASolicitudSchema(Schema):
    id_tipo = fields.Integer(required=True)
    cantidad = fields.Integer(required=True, validate=validate.Range(min=1))
    observaciones = fields.String(required=False, allow_none=True)
    imagen_url = fields.Url(required=False)
