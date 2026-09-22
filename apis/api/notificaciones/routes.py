from flask import Blueprint, request, jsonify
from utils.auth import requiere_auth, id_actual, es_propio, prohibido
from api.notificaciones.services import (
    obtener_notificaciones,
    marcar_como_leida
)

notificaciones_bp = Blueprint('notificaciones_bp', __name__)

@notificaciones_bp.route('/<int:id_usuario>', methods=['GET'])
@requiere_auth()
def api_obtener_notificaciones(id_usuario):
    if not es_propio(id_usuario):
        return prohibido()
    solo_no_leidas = request.args.get('no_leidas') == 'true'
    notis = obtener_notificaciones(id_actual(), solo_no_leidas)
    return jsonify(notis), 200


@notificaciones_bp.route('/<int:id_notificacion>/leido', methods=['PATCH'])
@requiere_auth()
def api_marcar_leida(id_notificacion):
    if not marcar_como_leida(id_notificacion, id_actual()):
        return jsonify({"msg": "Notificación no encontrada"}), 404
    return jsonify({"msg": "Notificación marcada como leída"}), 200