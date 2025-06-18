from flask import Blueprint, request, jsonify
from api.notificaciones.services import (
    crear_notificacion,
    obtener_notificaciones,
    marcar_como_leida
)

notificaciones_bp = Blueprint('notificaciones_bp', __name__)

@notificaciones_bp.route('/<int:id_usuario>', methods=['GET'])
def api_obtener_notificaciones(id_usuario):
    solo_no_leidas = request.args.get('no_leidas') == 'true'
    notis = obtener_notificaciones(id_usuario, solo_no_leidas)
    return jsonify(notis), 200


@notificaciones_bp.route('', methods=['POST'])
def api_crear_notificacion():
    data = request.get_json()
    crear_notificacion(
        data['id_usuario'],
        data['tipo_evento'],
        data['tabla_referencia'],
        data['id_referencia'],
        data['mensaje']
    )
    return jsonify({"msg": "Notificación creada"}), 201


@notificaciones_bp.route('/<int:id_notificacion>/leido', methods=['PATCH'])
def api_marcar_leida(id_notificacion):
    marcar_como_leida(id_notificacion)
    return jsonify({"msg": "Notificación marcada como leída"}), 200