from flask import Blueprint, request, jsonify
from api.asignaciones.services import (
    list_my_asignaciones,
    create_asignacion,
    change_estado_asignacion,
    cancel_asignacion
)
from api.asignaciones.schemas import CrearAsignacionSchema
from marshmallow import ValidationError

asignaciones_bp = Blueprint("asignaciones_bp", __name__)

@asignaciones_bp.route("/me", methods=["GET"])
def get_me_asignaciones():
    asigns = list_my_asignaciones()
    return jsonify(asigns), 200

@asignaciones_bp.route("", methods=["POST"])
def post_asignacion():
    payload = request.get_json()
    schema = CrearAsignacionSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    new_asig = create_asignacion(data)
    return jsonify(new_asig), 201

@asignaciones_bp.route("/<int:id_asignacion>/confirmar", methods=["PUT"])
def put_confirmar(id_asignacion):
    # Sólo transportista
    updated = change_estado_asignacion(id_asignacion, "confirmado")
    return jsonify(updated), 200

@asignaciones_bp.route("/<int:id_asignacion>/rechazar", methods=["PUT"])
def put_rechazar(id_asignacion):
    updated = change_estado_asignacion(id_asignacion, "rechazado")
    return jsonify(updated), 200

@asignaciones_bp.route("/<int:id_asignacion>/completar", methods=["PUT"])
def put_completar(id_asignacion):
    # Aquí podrías verificar que el GPS esté dentro del radio permitido
    updated = change_estado_asignacion(id_asignacion, "completado")
    # (Disparar generación de comprobante de pago y notificaciones)
    return jsonify(updated), 200

@asignaciones_bp.route("/<int:id_asignacion>/cancelar", methods=["PUT"])
def put_cancelar(id_asignacion):
    result = cancel_asignacion(id_asignacion)
    return jsonify(result), 200

@asignaciones_bp.route("/<int:id_asignacion>/estado", methods=["GET"])
def get_estado(id_asignacion):
    from api.asignaciones.services import get_asignacion_by_id
    asig = get_asignacion_by_id(id_asignacion)
    if not asig:
        return jsonify({"msg": "Asignación no encontrada"}), 404
    return jsonify({"id_asignacion": id_asignacion, "estado": asig["estado"]}), 200
