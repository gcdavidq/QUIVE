from flask import Blueprint, request, jsonify
from api.calificaciones.services import (
    create_calificacion,
    list_calificaciones_de_usuario,
    list_my_calificaciones
)
from api.calificaciones.schemas import CrearCalificacionSchema
from marshmallow import ValidationError

calificaciones_bp = Blueprint("calificaciones_bp", __name__)

@calificaciones_bp.route("", methods=["POST"])
def post_calificacion():
    payload = request.get_json()
    schema = CrearCalificacionSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = create_calificacion(data)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 201

@calificaciones_bp.route("/<int:id_usuario>", methods=["GET"])
def get_calificaciones_usuario(id_usuario):
    cals = list_calificaciones_de_usuario(id_usuario)
    return jsonify(cals), 200

@calificaciones_bp.route("/me", methods=["GET"])
def get_my_calificaciones():
    cals = list_my_calificaciones()
    return jsonify(cals), 200
