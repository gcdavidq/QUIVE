from flask import Blueprint, request, jsonify, session
from api.auth.services import register_user, login_user
from api.auth.schemas import RegisterSchema, LoginSchema
from marshmallow import ValidationError
from utils.quickstart import subir_a_dropbox

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.form.to_dict()
    schema = RegisterSchema()
    try:
        if request.files.get("foto_perfil_url") is not None:
            file = request.files.get("foto_perfil_url")
            id_file = subir_a_dropbox(file, f"/{file.filename}")
            payload["foto_perfil_url"] = id_file  # o la ruta final
        else:
            payload["foto_perfil_url"] = 'https://www.dropbox.com/scl/fi/b4ttqjb0f6on9v4dxixwq/satoru-gojo-de-jujutsu-kaisen_3840x2160_xtrafondos.com.jpg?rlkey=j9xq97kkqcxdsojldqxnvbeha&dl=0'
        data = schema.load(payload)

    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = register_user(data)
    session["usuario"] = result
    print(result)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json()
    schema = LoginSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = login_user(data)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 401
    result.pop("contrasena_hash", None)
    session["usuario"] = result["usuario"]
    print(result)
    return jsonify(result), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"msg": "Sesión cerrada correctamente"}), 200
