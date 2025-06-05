from flask import Blueprint, request, jsonify
from api.notificaciones.services import (
    subscribe_device,
    unsubscribe_device,
    list_my_notificaciones,
    send_notification
)
from api.notificaciones.schemas import SubscribeSchema, UnsubscribeSchema, SendNotificationSchema
from marshmallow import ValidationError

notificaciones_bp = Blueprint("notificaciones_bp", __name__)

@notificaciones_bp.route("/subscribe", methods=["POST"])
def post_subscribe():
    payload = request.get_json()
    schema = SubscribeSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = subscribe_device(data)
    return jsonify(resultado), 201

@notificaciones_bp.route("/unsubscribe", methods=["POST"])
def post_unsubscribe():
    payload = request.get_json()
    schema = UnsubscribeSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = unsubscribe_device(data)
    return jsonify(resultado), 200

@notificaciones_bp.route("/me", methods=["GET"])
def get_me_notificaciones():
    notis = list_my_notificaciones()
    return jsonify(notis), 200

@notificaciones_bp.route("/enviar", methods=["POST"])
def post_enviar_notificacion():
    # Sólo ADMIN
    payload = request.get_json()
    schema = SendNotificationSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = send_notification(data)
    return jsonify(resultado), 201
