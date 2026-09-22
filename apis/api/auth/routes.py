from flask import Blueprint, request, jsonify, session
from api.auth.services import verificar_existencia_usuario, registrar_usuario, actualizar_usuario, login_user, create_or_get_google_user, verify_google_token
from api.auth.schemas import RegisterSchema, LoginSchema
from marshmallow import ValidationError
from utils.quickstart import subir_a_dropbox
from utils.enviar_email import enviar_email
from utils.auth import emitir_token, usuario_desde_request, emitir_comprobante_codigo, validar_comprobante_codigo
import secrets

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/enviar-codigo", methods=["POST"])
def enviar_codigo():
    """
    Genera el código en el servidor y lo envía por correo. Antes el código lo generaba
    el navegador y viajaba en el body, así que la verificación era decorativa.
    Devuelve un comprobante firmado (sin el código) que luego valida /verificar-codigo.
    """
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    codigo = f"{secrets.randbelow(1_000_000):06d}"
    mensaje = f"""
        <h3>Código de verificación</h3>
        <p>Tu código de verificación es: <strong>{codigo}</strong></p>
        <p>Vence en 10 minutos.</p>
    """

    if not enviar_email(email, "Tu código de verificación QUIVE", mensaje):
        return jsonify({"msg": "Error al enviar el correo"}), 500
    return jsonify({"msg": "Código enviado exitosamente", "comprobante": emitir_comprobante_codigo(email, codigo)}), 200


@auth_bp.route("/verificar-codigo", methods=["POST"])
def verificar_codigo():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if validar_comprobante_codigo(data.get("comprobante"), email, str(data.get("codigo") or "")):
        return jsonify({"verificado": True}), 200
    return jsonify({"verificado": False, "msg": "Código incorrecto o vencido"}), 400


@auth_bp.route("/verificar-usuario", methods=["POST"])
def verificar_usuario():
    data = request.json
    email = data.get("email")
    dni = data.get("dni")
    telefono = data.get("telefono")

    if not all([email, dni, telefono]):
        return jsonify({"msg": "Faltan campos requeridos"}), 400

    existe = verificar_existencia_usuario(email, dni, telefono)
    return jsonify({"existe": existe}), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.form.to_dict()
    schema = RegisterSchema()
    try:
        if request.files.get("foto_perfil_url") is not None:
            file = request.files.get("foto_perfil_url")
            id_file = subir_a_dropbox(file, f"/{file.filename}")
            payload["foto_perfil_url"] = id_file
        elif request.form.get("foto_perfil_url"):
            payload["foto_perfil_url"] = request.form.get("foto_perfil_url")
        else:
            # Sin foto: la interfaz muestra las iniciales del usuario.
            payload["foto_perfil_url"] = ''
        data = schema.load(payload)

    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # 👇 Registro o actualización
    if "id_usuario" in data:
        # Editar un perfil exige sesión y solo puede editarse el perfil propio.
        actual = usuario_desde_request()
        if not actual:
            return jsonify({"msg": "Sesión no válida o expirada"}), 401
        if str(actual["id_usuario"]) != str(data["id_usuario"]):
            return jsonify({"msg": "Solo puedes editar tu propio perfil"}), 403
        # El rol no es editable desde el perfil: se conserva el real.
        data["tipo_usuario"] = actual["tipo_usuario"]
        result = actualizar_usuario(data)
    else:
        if not data.get("contrasena"):
            return jsonify({"msg": "La contraseña es obligatoria"}), 400
        result = registrar_usuario(data)

    if "error" in result:
        return jsonify({"msg": result["error"]}), 400
    result["token"] = emitir_token(result["usuario"]["id_usuario"])
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
    result["token"] = emitir_token(result["usuario"]["id_usuario"])
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
            "token": emitir_token(result["usuario"]["id_usuario"]),
            **result  # Incluye la información del usuario
        }), 200

    except Exception as e:
        print(f"Error en Google login: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500

