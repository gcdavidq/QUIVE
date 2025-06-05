from marshmallow import Schema, fields

class CrearIncidenteSchema(Schema):
    id_asignacion = fields.Integer(required=True)
    descripcion = fields.String(required=True)
    foto_url = fields.Url(required=False)
