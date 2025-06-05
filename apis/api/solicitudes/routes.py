from flask import Blueprint, request, jsonify
from api.solicitudes.services import (
    list_my_solicitudes,
    get_solicitud_by_id,
    create_solcitud,
    update_solicitud,
    list_solicitudes_disponibles,
    get_tarifa_detallada
)
from api.solicitudes.schemas import CrearSolicitudSchema, ActualizarSolicitudSchema
from marshmallow import ValidationError

solicitudes_bp = Blueprint("solicitudes_bp", __name__)

@solicitudes_bp.route("/me", methods=["GET"])
def get_me_solicitudes():
    sols = list_my_solicitudes()
    return jsonify(sols), 200

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

    resultado = create_solcitud(data)
    return jsonify(resultado), 201

@solicitudes_bp.route("/<int:id_solicitud>", methods=["PUT"])
def put_solicitud(id_solicitud):
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

@solicitudes_bp.route("/<int:id_solicitud>/tarifa", methods=["GET"])
def get_tarifa(id_solicitud):
    detalle = get_tarifa_detallada(id_solicitud)
    return jsonify(detalle), 200
