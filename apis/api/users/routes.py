from flask import Blueprint, request, jsonify
from api.users.services import (
    update_current_user_profile,
    change_current_user_password,
    get_user_by_id,
    list_all_users,
    change_user_status,
    delete_user_account
)
from api.users.schemas import UpdateProfileSchema, ChangePasswordSchema
from marshmallow import ValidationError

users_bp = Blueprint("users_bp", __name__)

@users_bp.route("/<int:id_usuario>", methods=["DELETE"])
def delete_account(id_usuario):
    id_usuario = id_usuario  # o como accedes al usuario actual
    result = delete_user_account(id_usuario)

    if "error" in result:
        return jsonify(result), 500
    return jsonify({"msg": "Cuenta eliminada exitosamente"}), 200

@users_bp.route("/id_usuario", methods=["PUT"])
def put_me(id_usuario):
    payload = request.get_json()
    schema = UpdateProfileSchema()
    try:
        data = schema.load(payload, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = update_current_user_profile(data)
    result['id_usuario'] = id_usuario
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 200

@users_bp.route("/me/change-password", methods=["PUT"])
def change_password():
    payload = request.get_json()
    schema = ChangePasswordSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = change_current_user_password(data)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 200

@users_bp.route("/<int:id_usuario>", methods=["GET"])
def get_user(id_usuario):
    # En producción, verifica que request.user["tipo_usuario"] == "admin" o request.user["id_usuario"] == id_usuario
    usuario = get_user_by_id(id_usuario)
    if not usuario:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify(usuario), 200

@users_bp.route("", methods=["GET"])
def get_users():
    # Sólo admin. Podrías revisar request.user["tipo_usuario"] antes
    filters = {}
    tipo = request.args.get("tipo_usuario")
    estado = request.args.get("estado_cuenta")
    if tipo:
        filters["tipo_usuario"] = tipo
    if estado:
        filters["estado_cuenta"] = estado
    usuarios = list_all_users(filters)
    return jsonify(usuarios), 200

@users_bp.route("/<int:id_usuario>/status", methods=["PUT"])
def put_user_status(id_usuario):
    # Sólo admin
    nuevo_estado = request.get_json().get("estado_cuenta")
    if nuevo_estado not in ("activo", "inactivo", "suspendido"):
        return jsonify({"msg": "Estado inválido"}), 400
    result = change_user_status(id_usuario, nuevo_estado)
    return jsonify(result), 200
