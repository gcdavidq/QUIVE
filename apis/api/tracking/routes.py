from flask import Blueprint, request, jsonify
from api.tracking.services import (
    post_tracking,
    get_ultimo_tracking,
    get_servicio_en_seguimiento
)
from api.tracking.schemas import TrackingPostSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, rol_actual, es_propio, prohibido, rol_en_asignacion

tracking_bp = Blueprint("tracking_bp", __name__)

@tracking_bp.route("", methods=["POST"])
@requiere_auth("transportista")
def post_tracking_route():
    """Reporte de posición GPS: exclusivo del transportista asignado."""
    payload = request.get_json()
    schema = TrackingPostSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = post_tracking(data, id_actual())
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@tracking_bp.route("/<int:id_asignacion>/ultimo", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_ultimo(id_asignacion):
    if rol_en_asignacion(id_asignacion) is None:
        return prohibido()
    punto = get_ultimo_tracking(id_asignacion)
    if not punto:
        return jsonify({"msg": "No hay datos de seguimiento"}), 404
    return jsonify(punto), 200

@tracking_bp.route("/ruta/<int:user_id>", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_ruta_tracking(user_id):
    if not es_propio(user_id):
        return prohibido()
    servicio = get_servicio_en_seguimiento(id_actual(), rol_actual())
    if not servicio:
        return jsonify({"msg": "No tienes traslados en seguimiento"}), 404
    return jsonify(servicio), 200
