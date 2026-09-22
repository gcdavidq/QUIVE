
from flask import Blueprint, request, jsonify
from api.metodosPago.services import (
    registrar_metodo_pago_usuario,
    listar_metodos_pago_usuario,
    actualizar_metodo_pago_usuario,
    eliminar_metodo_pago_usuario
)
from api.metodosPago.schemas import MetodoPagoSchema, ActualizarMetodoSchema, PagoSchema
from marshmallow import ValidationError
from utils.auth import requiere_auth, id_actual, es_propio, prohibido

metodos_pago_bp = Blueprint("metodos_pago_bp", __name__)

@metodos_pago_bp.route("/<int:usuario_id>", methods=["GET"])
@requiere_auth("cliente", "transportista")
def listar_metodos(usuario_id):
    if not es_propio(usuario_id):
        return prohibido()
    data = listar_metodos_pago_usuario(id_actual())
    return jsonify(data), 200

@metodos_pago_bp.route("/<int:usuario_id>", methods=["POST"])
@requiere_auth("cliente", "transportista")
def registrar_metodo(usuario_id):
    try:
        payload = MetodoPagoSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    if not es_propio(usuario_id):
        return prohibido()
    ok, msg = registrar_metodo_pago_usuario(id_actual(), payload["tipo"], payload["datos"])
    return jsonify({"msg": msg}), 201 if ok else 400

@metodos_pago_bp.route("/actualizar/<int:id_metodo>", methods=["PUT"])
@requiere_auth("cliente", "transportista")
def actualizar_metodo(id_metodo):
    try:
        payload = ActualizarMetodoSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    ok, msg = actualizar_metodo_pago_usuario(id_metodo, id_actual(), payload["tipo"], payload["datos"])
    return jsonify({"msg": msg}), 200 if ok else 400

@metodos_pago_bp.route("/eliminar/<int:id_metodo>", methods=["DELETE"])
@requiere_auth("cliente", "transportista")
def eliminar_metodo(id_metodo):
    ok, msg = eliminar_metodo_pago_usuario(id_metodo, id_actual())
    return jsonify({"msg": msg}), 200 if ok else 404
