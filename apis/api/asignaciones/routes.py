from flask import Blueprint, request, jsonify
from api.asignaciones.services import (
    list_my_asignaciones,
    create_asignacion,
    change_estado_asignacion,
    delete_asignacion,
    get_asignacion_by_id,
    precio_cotizado,
)
from api.asignaciones.schemas import CrearAsignacionSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, rol_actual, es_propio, prohibido, rol_en_solicitud, rol_en_asignacion

asignaciones_bp = Blueprint("asignaciones_bp", __name__)

# Qué estados puede fijar cada parte de la asignación.
ESTADOS_POR_ROL = {
    "transportista": {"confirmada", "rechazada"},
    "cliente": {"cancelada"},
}


@asignaciones_bp.route("/<int:id_usuario>/<string:tipo>", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_me_asignaciones(id_usuario, tipo):
    # El rol sale de la sesión, no de la URL: un cliente no puede pedir la bandeja de un transportista.
    if not es_propio(id_usuario) or tipo != rol_actual():
        return prohibido()
    asigns = list_my_asignaciones(id_actual(), rol_actual())
    return jsonify(asigns), 200


@asignaciones_bp.route("", methods=["POST"])
@requiere_auth("cliente")
def post_asignacion():
    payload = request.get_json()
    schema = CrearAsignacionSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if rol_en_solicitud(data["id_solicitud"]) != "cliente":
        return prohibido("Solo puedes asignar transportistas a tus propias solicitudes")

    # El precio lo fija la cotización del servidor, no el cliente.
    precio = precio_cotizado(data["id_solicitud"], data["id_transportista"])
    if precio is None:
        return jsonify({"msg": "El transportista no tiene una cotización válida para esta solicitud"}), 400
    data["precio"] = precio

    new_asig = create_asignacion(data)
    return jsonify(new_asig), 201


@asignaciones_bp.route('/<int:id_asignacion>/respuesta', methods=['POST'])
@requiere_auth("cliente", "transportista")
def responder_asignacion(id_asignacion):
    data = request.get_json() or {}
    parte = rol_en_asignacion(id_asignacion)
    if parte is None:
        return prohibido()
    if data.get("estado") not in ESTADOS_POR_ROL[parte]:
        return prohibido("Tu rol no puede fijar ese estado en la asignación")

    resultado = change_estado_asignacion(id_asignacion, data, id_actual())
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), resultado.get("status", 400)
    return jsonify(resultado), 200


@asignaciones_bp.route("/<int:id_asignacion>/estado", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_estado(id_asignacion):
    asig = get_asignacion_by_id(id_asignacion)
    if not asig:
        return jsonify({"msg": "Asignación no encontrada"}), 404
    if rol_en_asignacion(id_asignacion) is None:
        return prohibido()
    return jsonify({"id_asignacion": id_asignacion, "estado": asig["estado"]}), 200


@asignaciones_bp.route("/<int:id_asignacion>", methods=["DELETE"])
@requiere_auth("cliente")
def borrar_asignacion(id_asignacion):
    if not get_asignacion_by_id(id_asignacion):
        return jsonify({"msg": "Asignación no encontrada."}), 404
    if rol_en_asignacion(id_asignacion) != "cliente":
        return prohibido()
    delete_asignacion(id_asignacion)
    return jsonify({"mensaje": "Asignación eliminada correctamente."}), 200
