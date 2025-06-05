from marshmallow import Schema, fields, validate

class CrearCalificacionSchema(Schema):
    id_asignacion = fields.Integer(required=True)
    calificador = fields.Integer(required=True)
    calificado = fields.Integer(required=True)
    puntaje = fields.Integer(required=True, validate=validate.Range(min=1, max=5))
    comentario = fields.String(required=False)
