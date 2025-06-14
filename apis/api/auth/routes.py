from flask import Blueprint, request, jsonify, session
from api.auth.services import register_or_update_user, login_user, create_or_get_google_user, verify_google_token
from api.auth.schemas import RegisterSchema, LoginSchema
from marshmallow import ValidationError
from utils.quickstart import subir_a_dropbox

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.form.to_dict()
    schema = RegisterSchema()
    print(payload)
    try:
        if request.files.get("foto_perfil_url") is not None:
            file = request.files.get("foto_perfil_url")
            id_file = subir_a_dropbox(file, f"/{file.filename}")
            payload["foto_perfil_url"] = id_file  # o la ruta final
        elif request.form.get("foto_perfil_url"):
            payload["foto_perfil_url"] = request.form.get("foto_perfil_url")
        else:
            payload["foto_perfil_url"] = 'https://dl.dropboxusercontent.com/scl/fi/jq4kjwhrqyjkmnwrpw3ks/blank-profile-picture-973460_1280.png?rlkey=ol5z7dhlc0nc6mvtff2r680sr&st=i5vppvhq'
        data = schema.load(payload)
        print(data)

    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = register_or_update_user(data)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    return jsonify(result), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json()
    print(payload)
    schema = LoginSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    result = login_user(data)
    if "error" in result:
        return jsonify({"msg": result["error"]}), 401
    result.pop("contrasena_hash", None)
    return jsonify(result), 200




@auth_bp.route("/google", methods=["POST"])
def google_login():
    try:
        payload = request.get_json()
        token = payload.get('token')
        if not token:
            return jsonify({"error": "Token requerido"}), 400


        # Verifica el token con Google
        google_data = verify_google_token(token)

        if not google_data:
            return jsonify({"error": "Token inválido"}), 401

        # Crea o busca el usuario
        result = create_or_get_google_user(google_data)
        if "error" in result:
            return jsonify({"msg": result["error"]}), 400

        return jsonify({
            "status": "success",
            **result  # Incluye la información del usuario
        }), 200

    except Exception as e:
        print(f"Error en Google login: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

