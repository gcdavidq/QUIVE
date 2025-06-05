from flask import Blueprint, request, jsonify
from api.incidentes.services import (
    create_incidente,
    get_incidente_by_id,
    list_my_incidentes,
    list_incidentes_by_asignacion,
    change_incidente_status
)
from api.incidentes.schemas import CrearIncidenteSchema
from marshmallow import ValidationError

incidentes_bp = Blueprint("incidentes_bp", __name__)

@incidentes_bp.route("", methods=["POST"])
def post_incidente():
    payload = request.get_json()
    schema = CrearIncidenteSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = create_incidente(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@incidentes_bp.route("/me", methods=["GET"])
def get_me_incidentes():
    incs = list_my_incidentes()
    return jsonify(incs), 200

@incidentes_bp.route("/<int:id_incidente>", methods=["GET"])
def get_by_id_incidente(id_incidente):
    inc = get_incidente_by_id(id_incidente)
    if not inc:
        return jsonify({"msg": "Incidente no encontrado"}), 404
    return jsonify(inc), 200

@incidentes_bp.route("/<int:id_incidente>/estado", methods=["PUT"])
def put_estado_incidente(id_incidente):
    payload = request.get_json()
    nuevo_estado = payload.get("estado")
    # En esta implementación básica no cambiamos nada en DB (tabla no tiene campo estado).
    resultado = change_incidente_status(id_incidente, nuevo_estado)
    return jsonify(resultado), 200

@incidentes_bp.route("/<int:id_asignacion>/incidentes", methods=["GET"])
def get_incidentes_asignacion(id_asignacion):
    incs = list_incidentes_by_asignacion(id_asignacion)
    return jsonify(incs), 200
