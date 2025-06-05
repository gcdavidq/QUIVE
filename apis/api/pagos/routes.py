from flask import Blueprint, request, jsonify
from api.pagos.services import (
    list_my_pagos,
    create_pago,
    webhook_pago,
    refund_pago,
    list_my_metodos,
    create_metodo,
    update_metodo,
    delete_metodo
)
from api.pagos.schemas import CrearPagoSchema, MetodoPagoSchema
from marshmallow import ValidationError

pagos_bp = Blueprint("pagos_bp", __name__)

@pagos_bp.route("/me", methods=["GET"])
def get_me_pagos():
    pagos = list_my_pagos()
    return jsonify(pagos), 200

@pagos_bp.route("", methods=["POST"])
def post_pago():
    payload = request.get_json()
    schema = CrearPagoSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = create_pago(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@pagos_bp.route("/webhook", methods=["POST"])
def post_webhook():
    payload = request.get_json()
    resultado = webhook_pago(payload)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200

@pagos_bp.route("/<int:id_pago>/reembolsar", methods=["PUT"])
def put_reembolsar(id_pago):
    # Sólo ADMIN
    resultado = refund_pago(id_pago)
    return jsonify(resultado), 200

# --- Métodos de Pago del cliente ---
@pagos_bp.route("/metodos-pago/me", methods=["GET"])
def get_me_metodos():
    metodos = list_my_metodos()
    return jsonify(metodos), 200

@pagos_bp.route("/metodos-pago/me", methods=["POST"])
def post_me_metodos():
    payload = request.get_json()
    schema = MetodoPagoSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    nuevo = create_metodo(data)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201

@pagos_bp.route("/metodos-pago/me/<int:id_metodo>", methods=["PUT"])
def put_me_metodos(id_metodo):
    payload = request.get_json()
    schema = MetodoPagoSchema(partial=True)
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    updated = update_metodo(id_metodo, data)
    if "error" in updated:
        return jsonify({"msg": updated["error"]}), 400
    return jsonify(updated), 200

@pagos_bp.route("/metodos-pago/me/<int:id_metodo>", methods=["DELETE"])
def delete_me_metodos(id_metodo):
    resultado = delete_metodo(id_metodo)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200
