from flask import Blueprint, request, jsonify, session
from api.auth.services import register_or_update_user, login_user
from api.auth.schemas import RegisterSchema, LoginSchema
from marshmallow import ValidationError
from utils.quickstart import subir_a_dropbox
from google.auth.transport import requests
from google.oauth2 import id_token
import os
from db import get_db

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
            payload["foto_perfil_url"] = 'https://dl.dropboxusercontent.com/scl/fi/b4ttqjb0f6on9v4dxixwq/satoru-gojo-de-jujutsu-kaisen_3840x2160_xtrafondos.com.jpg?rlkey=j9xq97kkqcxdsojldqxnvbeha'
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


def verify_google_token(token):
    """
    Verifica el token de Google y extrae la información del usuario
    """
    try:
        # Reemplaza con tu CLIENT_ID de Google
        CLIENT_ID = os.getenv('273165541469-spobn0clm5tj7f68116fg8lutk0n4j4u.apps.googleusercontent.com')  # Guárdalo en variables de entorno

        # Verifica el token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        # Verifica que el token es para tu aplicación
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return {
            'email': idinfo['email'],
            'nombre': idinfo['name'],
            'google_id': idinfo['sub'],
            'foto_perfil': idinfo.get('picture', '')
        }
    except ValueError as e:
        return None


def create_or_get_google_user(google_data):
    """
    Busca un usuario existente por email o crea uno nuevo para Google OAuth
    COMPATIBILIDAD: No afecta usuarios existentes que se registraron normalmente
    """
    conn = get_db()
    cursor = conn.cursor()

    # Busca si ya existe un usuario con ese email (registrado normal o con Google)
    sql_get = "SELECT * FROM Usuarios WHERE email = %s"
    cursor.execute(sql_get, (google_data['email'],))
    usuario = cursor.fetchone()

    if usuario:
        # CASO 1: Usuario existente (registrado normalmente)
        # Solo vincula la cuenta de Google sin afectar sus datos existentes
        if not usuario.get('google_id'):
            sql_update = """
                UPDATE Usuarios 
                SET google_id = %s 
                WHERE email = %s
            """
            cursor.execute(sql_update, (
                google_data['google_id'],
                google_data['email']
            ))
            conn.commit()

            # Actualiza el objeto usuario
            usuario['google_id'] = google_data['google_id']

        # Verifica que la cuenta esté activa
        if usuario["estado_cuenta"] != "activo":
            return {"error": "Cuenta no activa"}

        # Elimina la contraseña hash de la respuesta
        if 'contrasena_hash' in usuario:
            del usuario['contrasena_hash']

        return {"usuario": usuario}

    else:
        # CASO 2: Usuario completamente nuevo vía Google
        # Crea un perfil básico que deberá completar después
        sql_insert = """
            INSERT INTO Usuarios (
                nombre_completo, email, google_id, foto_perfil_url, 
                tipo_usuario, estado_cuenta, dni, telefono, ubicacion, contrasena_hash
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql_insert, (
            google_data['nombre'],
            google_data['email'],
            google_data['google_id'],
            google_data['foto_perfil'],
            'cliente',  # tipo por defecto
            'activo',  # estado por defecto
            '',  # DNI vacío - deberá completarlo
            '',  # Teléfono vacío - deberá completarlo
            '',  # Ubicación vacía - deberá completarla
            None  # Sin contraseña - solo acceso vía Google
        ))

        user_id = cursor.lastrowid
        conn.commit()

        # Obtiene el usuario recién creado
        cursor.execute("SELECT * FROM Usuarios WHERE id_usuario = %s", (user_id,))
        nuevo_usuario = cursor.fetchone()

        if 'contrasena_hash' in nuevo_usuario:
            del nuevo_usuario['contrasena_hash']

        return {
            "usuario": nuevo_usuario,
            "needs_completion": True  # Flag para indicar que necesita completar perfil
        }

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
