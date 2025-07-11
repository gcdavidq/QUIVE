from flask import Blueprint, request, jsonify
from api.tracking.services import (
    post_tracking,
    get_ultimo_tracking,
    get_ruta_tracking_s
)
from api.tracking.schemas import TrackingPostSchema
from marshmallow import ValidationError

tracking_bp = Blueprint("tracking_bp", __name__)

@tracking_bp.route("", methods=["POST"])
def post_tracking_route():
    payload = request.get_json()
    schema = TrackingPostSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = post_tracking(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@tracking_bp.route("/<int:id_asignacion>/ultimo", methods=["GET"])
def get_ultimo(id_asignacion):
    punto = get_ultimo_tracking(id_asignacion)
    if not punto:
        return jsonify({"msg": "No hay datos de seguimiento"}), 404
    return jsonify(punto), 200

@tracking_bp.route("/ruta/<int:user_id>", methods=["GET"])
def get_ruta_tracking(user_id):
    print(user_id)
    ruta = get_ruta_tracking_s(user_id)
    if not ruta:
        return jsonify({"msg": "No tienes solicitudes pendientes"}), 404
    return jsonify(ruta), 200
