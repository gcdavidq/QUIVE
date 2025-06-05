from marshmallow import Schema, fields, validate

class SubscribeSchema(Schema):
    device_token = fields.String(required=True)
    plataforma = fields.String(required=True, validate=validate.OneOf(["Android", "iOS", "Web"]))

class UnsubscribeSchema(Schema):
    device_token = fields.String(required=True)

class SendNotificationSchema(Schema):
    id_usuario = fields.Integer(required=True)
    tipo = fields.String(required=True)
    mensaje = fields.String(required=True)
