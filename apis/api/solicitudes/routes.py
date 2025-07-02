from flask import Blueprint, request, jsonify
from api.solicitudes.services import (
    get_solicitud_by_user_id,
    get_solicitud_by_id,
    create_solicitud,
    change_estado_solicitud,
    actualizar_solicitud_completa,
    list_solicitudes_disponibles
)
from api.solicitudes.schemas import CrearSolicitudSchema, ActualizarSolicitudSchema
from marshmallow import ValidationError

solicitudes_bp = Blueprint("solicitudes_bp", __name__)

@solicitudes_bp.route("/mi_solicitud/<int:usuario_id>", methods=["GET"])
def get_mi_solicitud(usuario_id):
    user_id = usuario_id
    sol = get_solicitud_by_user_id(user_id)
    if not sol:
        return jsonify({"msg": "No tienes solicitudes pendientes"}), 404
    return jsonify(sol), 200


@solicitudes_bp.route("/<int:id_solicitud>", methods=["GET"])
def get_by_id_solicitud(id_solicitud):
    sol = get_solicitud_by_id(id_solicitud)
    if not sol:
        return jsonify({"msg": "Solicitud no encontrada"}), 404
    return jsonify(sol), 200

@solicitudes_bp.route("", methods=["POST"])
def post_solicitud():
    payload = request.get_json()
    schema = CrearSolicitudSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = create_solicitud(data)
    return jsonify(resultado), 201

@solicitudes_bp.route("/<int:id_solicitud>", methods=["PUT"])
def put_solicitud(id_solicitud):
    payload = request.get_json()
    schema = CrearSolicitudSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    resultado = actualizar_solicitud_completa(id_solicitud, data)
    return jsonify(resultado), 201

@solicitudes_bp.route("/actualizar_estado/<int:id_solicitud>", methods=["PUT"])
def put_estado_solicitud(id_solicitud):
    payload = request.get_json()
    nuevo_estado = payload['estado']
    id_pagador = payload['metodo_pago']
    tipo_metodo = payload['tipo_metodo']
    id_asignacion = payload['id_asignacion']
    monto = payload['monto']
    resultado = change_estado_solicitud(id_solicitud, nuevo_estado, id_pagador, tipo_metodo, id_asignacion, monto)
    return jsonify(resultado), 201

@solicitudes_bp.route("/<int:id_solicitud>/elegido", methods=["PUT"])
def put_solicitud_elegida(id_solicitud):
    payload = request.get_json()
    schema = ActualizarSolicitudSchema(partial=True)
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = update_solicitud(id_solicitud, data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200

@solicitudes_bp.route("/disponibles", methods=["GET"])
def get_solicitudes_disponibles():
    filtros = {
        "lat": request.args.get("lat"),
        "lng": request.args.get("lng"),
        "tipo_vehiculo": request.args.get("tipo_vehiculo"),
        "reputacion_minima": request.args.get("reputacion_minima")
    }
    resultado = list_solicitudes_disponibles(filtros)
    return jsonify(resultado), 200