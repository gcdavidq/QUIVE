from flask import Blueprint, request, jsonify
from api.solicitudes.services import (
    get_solicitud_by_user_id,
    get_solicitud_by_id,
    create_solicitud,
    change_estado_solicitud,
    actualizar_solicitud_completa,
    list_solicitudes_disponibles,
    update_solicitud
)
from api.solicitudes.schemas import CrearSolicitudSchema, ActualizarSolicitudSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, es_propio, prohibido, rol_en_solicitud

solicitudes_bp = Blueprint("solicitudes_bp", __name__)

# Qué estados de la solicitud puede fijar cada parte.
ESTADOS_POR_ROL = {
    "cliente": {"confirmada", "cancelada"},      # pagar / cancelar
    "transportista": {"activa", "finalizada"},   # iniciar / terminar el traslado
}


@solicitudes_bp.route("/mi_solicitud/<int:usuario_id>", methods=["GET"])
@requiere_auth("cliente")
def get_mi_solicitud(usuario_id):
    if not es_propio(usuario_id):
        return prohibido()
    sol = get_solicitud_by_user_id(id_actual())
    if not sol:
        return jsonify({"msg": "No tienes solicitudes pendientes"}), 404
    return jsonify(sol), 200


@solicitudes_bp.route("/<int:id_solicitud>", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_by_id_solicitud(id_solicitud):
    sol = get_solicitud_by_id(id_solicitud)
    if not sol:
        return jsonify({"msg": "Solicitud no encontrada"}), 404
    if rol_en_solicitud(id_solicitud) is None:
        return prohibido()
    return jsonify(sol), 200

@solicitudes_bp.route("", methods=["POST"])
@requiere_auth("cliente")
def post_solicitud():
    payload = request.get_json()
    schema = CrearSolicitudSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    # La solicitud siempre se crea a nombre del cliente autenticado.
    data["id_usuario"] = id_actual()
    resultado = create_solicitud(data)
    return jsonify(resultado), 201

@solicitudes_bp.route("/<int:id_solicitud>", methods=["PUT"])
@requiere_auth("cliente")
def put_solicitud(id_solicitud):
    if rol_en_solicitud(id_solicitud) != "cliente":
        return prohibido()
    payload = request.get_json()
    schema = CrearSolicitudSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = actualizar_solicitud_completa(id_solicitud, data)
    return jsonify(resultado), 201

@solicitudes_bp.route("/actualizar_estado/<int:id_solicitud>", methods=["PUT"])
@requiere_auth("cliente", "transportista")
def put_estado_solicitud(id_solicitud):
    payload = request.get_json() or {}
    nuevo_estado = payload.get('estado')
    parte = rol_en_solicitud(id_solicitud)
    if parte is None:
        return prohibido()
    if nuevo_estado not in ESTADOS_POR_ROL[parte]:
        return prohibido("Tu rol no puede fijar ese estado en la solicitud")

    resultado = change_estado_solicitud(id_solicitud, nuevo_estado, payload, id_actual())
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), resultado.get("status", 400)
    return jsonify(resultado), 200

@solicitudes_bp.route("/<int:id_solicitud>/elegido", methods=["PUT"])
@requiere_auth("cliente")
def put_solicitud_elegida(id_solicitud):
    if rol_en_solicitud(id_solicitud) != "cliente":
        return prohibido()
    payload = request.get_json()
    schema = ActualizarSolicitudSchema(partial=True)
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = update_solicitud(id_solicitud, data, id_actual())
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200

@solicitudes_bp.route("/disponibles", methods=["GET"])
@requiere_auth("transportista")
def get_solicitudes_disponibles():
    filtros = {
        "lat": request.args.get("lat"),
        "lng": request.args.get("lng"),
        "tipo_vehiculo": request.args.get("tipo_vehiculo"),
        "reputacion_minima": request.args.get("reputacion_minima")
    }
    resultado = list_solicitudes_disponibles(filtros)
    return jsonify(resultado), 200