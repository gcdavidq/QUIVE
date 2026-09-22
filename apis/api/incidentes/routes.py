from flask import Blueprint, request, jsonify
from api.incidentes.services import (
    create_incidente,
    get_incidente_by_id,
    list_my_incidentes,
    list_incidentes_by_asignacion,
)
from api.incidentes.schemas import CrearIncidenteSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, rol_actual, prohibido, rol_en_asignacion

incidentes_bp = Blueprint("incidentes_bp", __name__)

@incidentes_bp.route("", methods=["POST"])
@requiere_auth("cliente", "transportista")
def post_incidente():
    payload = request.get_json()
    schema = CrearIncidenteSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if rol_en_asignacion(data["id_asignacion"]) is None:
        return prohibido("Solo las partes del servicio pueden reportar un incidente")

    resultado = create_incidente(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@incidentes_bp.route("/me", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_me_incidentes():
    incs = list_my_incidentes(id_actual(), rol_actual())
    return jsonify(incs), 200

@incidentes_bp.route("/<int:id_incidente>", methods=["GET"])
@requiere_auth("cliente", "transportista", "admin")
def get_by_id_incidente(id_incidente):
    inc = get_incidente_by_id(id_incidente)
    if not inc:
        return jsonify({"msg": "Incidente no encontrado"}), 404
    if rol_actual() != "admin" and rol_en_asignacion(inc["id_asignacion"]) is None:
        return prohibido()
    return jsonify(inc), 200

# PUT /<id>/estado se retiró: la tabla Incidentes no tiene columna de estado y el
# endpoint respondía 200 sin cambiar nada (aparentaba una gestión que no existe).

@incidentes_bp.route("/<int:id_asignacion>/incidentes", methods=["GET"])
@requiere_auth("cliente", "transportista", "admin")
def get_incidentes_asignacion(id_asignacion):
    if rol_actual() != "admin" and rol_en_asignacion(id_asignacion) is None:
        return prohibido()
    incs = list_incidentes_by_asignacion(id_asignacion)
    return jsonify(incs), 200
