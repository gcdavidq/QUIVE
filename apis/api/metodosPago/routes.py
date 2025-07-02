
from flask import Blueprint, request, jsonify
from api.metodosPago.services import (
    registrar_metodo_pago_usuario,
    listar_metodos_pago_usuario,
    actualizar_metodo_pago_usuario,
    eliminar_metodo_pago_usuario
)
from api.metodosPago.schemas import MetodoPagoSchema, ActualizarMetodoSchema, PagoSchema
from marshmallow import ValidationError

metodos_pago_bp = Blueprint("metodos_pago_bp", __name__)

@metodos_pago_bp.route("/<int:usuario_id>", methods=["GET"])
def listar_metodos(usuario_id):
    data = listar_metodos_pago_usuario(usuario_id)
    return jsonify(data), 200

@metodos_pago_bp.route("/<int:usuario_id>", methods=["POST"])
def registrar_metodo(usuario_id):
    try:
        payload = MetodoPagoSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    print(payload)
    msg = registrar_metodo_pago_usuario(usuario_id, payload["tipo"], payload["datos"])
    return jsonify({"msg": msg}), 201

@metodos_pago_bp.route("/actualizar/<int:id_metodo>", methods=["PUT"])
def actualizar_metodo(id_metodo):
    try:
        payload = ActualizarMetodoSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    msg = actualizar_metodo_pago_usuario(id_metodo, payload["tipo"], payload["datos"])
    return jsonify({"msg": msg}), 200

@metodos_pago_bp.route("/eliminar/<int:id_metodo>", methods=["DELETE"])
def eliminar_metodo(id_metodo):
    msg = eliminar_metodo_pago_usuario(id_metodo)
    return jsonify({"msg": msg}), 200
