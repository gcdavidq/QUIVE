from flask import Blueprint, request, jsonify
from api.pagos.services import (
    create_pago_min,
    update_pago_by_asignacion,
    get_pago_by_asignacion
)
from api.pagos.schemas import (
    CrearPagoMinSchema,
    UpdatePagoSchema
)
from marshmallow import ValidationError

pagos_bp = Blueprint("pagos_bp", __name__)

@pagos_bp.route("/pagos", methods=["POST"])
def create_pago_route():
    """
    Crea un pago mínimo con id_asignacion y receptor_id.
    """
    try:
        data = CrearPagoMinSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    nuevo_id = create_pago_min(
        id_asignacion=data['id_asignacion'],
        receptor_id=data['receptor_id'],
        tipo_metodo_receptor=data['tipo_metodo']
    )
    return jsonify({'id_pago': nuevo_id}), 201

@pagos_bp.route("/pagos/<int:id_asignacion>", methods=["PATCH"])
def update_pago_route(id_asignacion):
    """
    Actualiza montos, pagador y tipo de método para un pago existente.
    """
    try:
        data = UpdatePagoSchema().load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    updated = update_pago_by_asignacion(
        id_asignacion,
        monto_total=data.get('monto_total'),
        pagador_id=data.get('pagador_id'),
        tipo_metodo_pagador=data.get('tipo_metodo')
    )
    if updated:
        return jsonify({'updated_rows': updated}), 200
    else:
        return jsonify({'message': 'Nothing to update or assignment not found.'}), 404

@pagos_bp.route("/pagos/<int:id_asignacion>", methods=["GET"])
def get_pago_route(id_asignacion):
    """
    Obtiene el pago asociado a la asignación dada.
    """
    pago = get_pago_by_asignacion(id_asignacion)
    if pago:
        return jsonify(pago), 200
    return jsonify({'message': 'Pago not found.'}), 404