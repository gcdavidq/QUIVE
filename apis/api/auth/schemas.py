from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class RegisterSchema(Schema):
    nombre_completo = fields.String(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    telefono = fields.String(required=True, validate=validate.Regexp(r"^\+?[0-9\-\s]+$"))
    dni = fields.String(required=True)
    contrasena = fields.String(required=True, validate=validate.Length(min=6))
    tipo_usuario = fields.String(required=True, validate=validate.OneOf(["cliente", "transportista"]))
    ubicacion = fields.String(required=True)
    foto_perfil_url = fields.String(required=True)

class LoginSchema(Schema):
    dni = fields.Str(required=False)
    email = fields.Email(required=False)
    contrasena = fields.Str(required=True)
