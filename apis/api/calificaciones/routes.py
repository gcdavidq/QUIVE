from flask import Blueprint, request, jsonify
from api.calificaciones.services import (
    create_calificacion,
    list_calificaciones_de_usuario,
    list_my_calificaciones
)
from api.calificaciones.schemas import CrearCalificacionSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, prohibido, rol_en_asignacion

calificaciones_bp = Blueprint("calificaciones_bp", __name__)

@calificaciones_bp.route("", methods=["POST"])
@requiere_auth("cliente", "transportista")
def post_calificacion():
    payload = request.get_json()
    schema = CrearCalificacionSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if rol_en_asignacion(data["id_asignacion"]) is None:
        return prohibido("Solo las partes del servicio pueden calificarlo")

    # Quién califica es el usuario autenticado; a quién califica es su contraparte en la asignación.
    result = create_calificacion(data, id_actual())
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 201

@calificaciones_bp.route("/me", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_my_calificaciones():
    cals = list_my_calificaciones(id_actual())
    return jsonify(cals), 200

@calificaciones_bp.route("/<int:id_usuario>", methods=["GET"])
@requiere_auth()
def get_calificaciones_usuario(id_usuario):
    cals = list_calificaciones_de_usuario(id_usuario)
    return jsonify(cals), 200
