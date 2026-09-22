from marshmallow import Schema, fields, validate, EXCLUDE

class CrearCalificacionSchema(Schema):
    class Meta:
        # calificador / calificado ya no se aceptan del cliente: se derivan de la sesión y la asignación.
        unknown = EXCLUDE

    id_asignacion = fields.Integer(required=True)
    puntaje = fields.Integer(required=True, validate=validate.Range(min=1, max=5))
    comentario = fields.String(required=False, allow_none=True)
