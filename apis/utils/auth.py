"""
Autenticación por token y control de acceso por rol / propiedad.

El token solo transporta el id del usuario. El rol NUNCA se toma del cliente
(URL, body o token): se lee de la base de datos en cada request, de modo que
un cambio de rol o una cuenta suspendida surten efecto de inmediato.
"""
import hashlib
import hmac
from functools import wraps

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from config import config
from db import get_db

TOKEN_MAX_AGE_SEGUNDOS = 7 * 24 * 60 * 60
_SALT = "quive-auth-token"


def _serializer():
    return URLSafeTimedSerializer(config.SECRET_KEY, salt=_SALT)


def emitir_token(id_usuario: int) -> str:
    return _serializer().dumps({"id_usuario": int(id_usuario)})


# ---------- Verificación de correo (sin estado en servidor) ----------
_SALT_CODIGO = "quive-codigo-correo"
CODIGO_MAX_AGE_SEGUNDOS = 10 * 60


def _huella_codigo(email: str, codigo: str) -> str:
    return hmac.new(config.SECRET_KEY.encode(), f"{email}:{codigo}".encode(), hashlib.sha256).hexdigest()


def emitir_comprobante_codigo(email: str, codigo: str) -> str:
    """Comprobante firmado que contiene solo la huella HMAC del código, nunca el código."""
    return URLSafeTimedSerializer(config.SECRET_KEY, salt=_SALT_CODIGO).dumps(_huella_codigo(email, codigo))


def validar_comprobante_codigo(comprobante, email: str, codigo: str) -> bool:
    if not comprobante:
        return False
    try:
        huella = URLSafeTimedSerializer(config.SECRET_KEY, salt=_SALT_CODIGO).loads(
            comprobante, max_age=CODIGO_MAX_AGE_SEGUNDOS)
    except (BadSignature, SignatureExpired):
        return False
    return hmac.compare_digest(huella, _huella_codigo(email, codigo))


def usuario_desde_request():
    cabecera = request.headers.get("Authorization", "")
    if not cabecera.startswith("Bearer "):
        return None
    try:
        datos = _serializer().loads(cabecera[7:].strip(), max_age=TOKEN_MAX_AGE_SEGUNDOS)
    except (BadSignature, SignatureExpired):
        return None

    cursor = get_db().cursor()
    cursor.execute(
        "SELECT id_usuario, tipo_usuario, estado_cuenta FROM Usuarios WHERE id_usuario = %s",
        (datos.get("id_usuario"),),
    )
    usuario = cursor.fetchone()
    if not usuario or usuario["estado_cuenta"] != "activo":
        return None
    return usuario


def requiere_auth(*roles):
    """
    @requiere_auth()                  -> cualquier usuario autenticado
    @requiere_auth("cliente")         -> solo clientes
    @requiere_auth("transportista")   -> solo transportistas
    @requiere_auth("admin")           -> solo administradores
    """
    def decorador(fn):
        @wraps(fn)
        def envoltura(*args, **kwargs):
            usuario = usuario_desde_request()
            if not usuario:
                return jsonify({"msg": "Sesión no válida o expirada"}), 401
            if roles and usuario["tipo_usuario"] not in roles:
                return jsonify({"msg": "Tu rol no tiene permiso para esta operación"}), 403
            g.usuario = usuario
            return fn(*args, **kwargs)
        return envoltura
    return decorador


def usuario_actual() -> dict:
    return g.usuario


def id_actual() -> int:
    return g.usuario["id_usuario"]


def rol_actual() -> str:
    return g.usuario["tipo_usuario"]


def prohibido(msg="No tienes permiso sobre este recurso"):
    return jsonify({"msg": msg}), 403


def es_propio(id_usuario) -> bool:
    """El id recibido (URL/body) debe ser el del usuario autenticado."""
    try:
        return int(id_usuario) == id_actual()
    except (TypeError, ValueError):
        return False


# ---------- Propiedad de recursos ----------

def rol_en_solicitud(id_solicitud: int):
    """'cliente' si es el dueño, 'transportista' si tiene una asignación sobre ella, None si es ajeno."""
    cursor = get_db().cursor()
    cursor.execute("SELECT id_cliente FROM Solicitudes WHERE id_solicitud = %s", (id_solicitud,))
    sol = cursor.fetchone()
    if not sol:
        return None
    if sol["id_cliente"] == id_actual():
        return "cliente"
    cursor.execute(
        "SELECT 1 FROM Asignaciones WHERE id_solicitud = %s AND id_transportista = %s LIMIT 1",
        (id_solicitud, id_actual()),
    )
    return "transportista" if cursor.fetchone() else None


def rol_en_asignacion(id_asignacion: int):
    """'cliente' / 'transportista' según la parte que ocupa el usuario en la asignación, None si es ajeno."""
    cursor = get_db().cursor()
    cursor.execute("""
        SELECT a.id_transportista, s.id_cliente
        FROM Asignaciones a
        JOIN Solicitudes s ON a.id_solicitud = s.id_solicitud
        WHERE a.id_asignacion = %s
    """, (id_asignacion,))
    fila = cursor.fetchone()
    if not fila:
        return None
    if fila["id_cliente"] == id_actual():
        return "cliente"
    if fila["id_transportista"] == id_actual():
        return "transportista"
    return None
