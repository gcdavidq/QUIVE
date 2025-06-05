from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class CrearSolicitudSchema(Schema):
    origen = fields.String(required=True)
    destino = fields.String(required=True)
    fecha_hora = fields.DateTime(required=True, format="%Y-%m-%dT%H:%M:%S")
    objetos = fields.List(
        fields.Dict(
            keys=fields.String(),
            values=fields.Raw()
        ),
        required=True
    )
    servicios_adicionales = fields.Dict(required=False)

    @validates_schema
    def validar_objetos(self, data, **kwargs):
        if not data.get("objetos") or not isinstance(data["objetos"], list):
            raise ValidationError("Debe incluir al menos un objeto en la solicitud")

class ActualizarSolicitudSchema(Schema):
    fecha_hora = fields.DateTime(required=False, format="%Y-%m-%dT%H:%M:%S")
    cancelar = fields.Boolean(required=False)
