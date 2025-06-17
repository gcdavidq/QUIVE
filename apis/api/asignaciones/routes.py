from flask import Blueprint, request, jsonify
from api.asignaciones.services import (
    list_my_asignaciones,
    create_asignacion,
    change_estado_asignacion,
    delete_asignacion
)
from api.asignaciones.schemas import CrearAsignacionSchema
from marshmallow import ValidationError

asignaciones_bp = Blueprint("asignaciones_bp", __name__)

@asignaciones_bp.route("/<int:id_usuario>/<string:tipo>", methods=["GET"])
def get_me_asignaciones(id_usuario, tipo):
    asigns = list_my_asignaciones(id_usuario, tipo)
    return jsonify(asigns), 200

@asignaciones_bp.route("", methods=["POST"])
def post_asignacion():
    payload = request.get_json()
    schema = CrearAsignacionSchema()
    print(payload)
    try:
        data = schema.load(payload)
        print(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    new_asig = create_asignacion(data)
    return jsonify(new_asig), 201


@asignaciones_bp.route('/<int:id_asignacion>/respuesta', methods=['POST'])
def responder_asignacion(id_asignacion):
    data = request.json
    nuevo_estado = data.get('estado') # 'confirmado' o 'rechazado'
    resultado = change_estado_asignacion(id_asignacion, nuevo_estado)
    print(resultado)
    return jsonify({"mensaje": "Estado actualizado y notificación creada."})


@asignaciones_bp.route("/<int:id_asignacion>/estado", methods=["GET"])
def get_estado(id_asignacion):
    from api.asignaciones.services import get_asignacion_by_id
    asig = get_asignacion_by_id(id_asignacion)
    if not asig:
        return jsonify({"msg": "Asignación no encontrada"}), 404
    return jsonify({"id_asignacion": id_asignacion, "estado": asig["estado"]}), 200

@asignaciones_bp.route("/<int:id_asignacion>", methods=["DELETE"])
def borrar_asignacion(id_asignacion):
    eliminado = delete_asignacion(id_asignacion)
    if eliminado:
        return jsonify({"mensaje": "Asignación eliminada correctamente."}), 200
    else:
        return jsonify({"msg": "Asignación no encontrada."}), 404