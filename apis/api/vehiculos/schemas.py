from marshmallow import Schema, fields, validate

class CreateVehiculoSchema(Schema):
    id_usuario = fields.Integer(required=True)
    id_tipo_vehiculo = fields.Integer(required=True)
    placa = fields.String(required=True, validate=validate.Length(min=3))

class UpdateVehiculoSchema(Schema):
    id_usuario = fields.Integer(required=True)
    id_tipo_vehiculo = fields.Integer(required=False)
    placa = fields.String(required=False, validate=validate.Length(min=3))
    estado = fields.String(validate=validate.OneOf(["activo", "inactivo"]))
