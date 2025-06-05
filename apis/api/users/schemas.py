from marshmallow import Schema, fields, validate

class UpdateProfileSchema(Schema):
    nombre_completo = fields.String(validate=validate.Length(min=3))
    telefono = fields.String(validate=validate.Regexp(r"^\+?[0-9\-\s]+$"))
    ubicacion = fields.String()
    foto_perfil_url = fields.Url()

class ChangePasswordSchema(Schema):
    contraseña_actual = fields.String(required=True)
    contraseña_nueva = fields.String(required=True, validate=validate.Length(min=6))
