from flask import Blueprint, request, jsonify
from api.vehiculos.services import (
    list_my_vehiculos,
    create_my_vehiculo,
    update_my_vehiculo,
    delete_my_vehiculo,
    list_tipos_vehiculo,
    datos_tipos_vehiculo,
    create_tipo_vehiculo,
    update_tipo_vehiculo,
    delete_tipo_vehiculo
)
from api.vehiculos.schemas import CreateVehiculoSchema, UpdateVehiculoSchema
from marshmallow import ValidationError

vehiculos_bp = Blueprint("vehiculos_bp", __name__)

# --- Vehículos del transportista ---
@vehiculos_bp.route("/me/<int:id_usuario>", methods=["GET"])
def get_me_vehiculos(id_usuario):
    vehs = list_my_vehiculos(id_usuario)
    return jsonify(vehs), 200

@vehiculos_bp.route("/me", methods=["POST"])
def post_me_vehiculo():
    payload = request.form.to_dict()
    print(payload)
    schema = CreateVehiculoSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    nuevo = create_my_vehiculo(data)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201

@vehiculos_bp.route("/me/<int:id_vehiculo>", methods=["PUT"])
def put_me_vehiculo(id_vehiculo):
    payload = request.get_json()
    schema = UpdateVehiculoSchema()
    try:
        data = schema.load(payload, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    actualizado = update_my_vehiculo(id_vehiculo, data)
    if "error" in actualizado:
        return jsonify({"msg": actualizado["error"]}), 400
    return jsonify(actualizado), 200

@vehiculos_bp.route("/me/<int:id_vehiculo>/<int:id_usuario>", methods=["DELETE"])
def delete_me_vehiculo(id_vehiculo, id_usuario):
    resultado = delete_my_vehiculo(id_vehiculo, id_usuario)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200

# --- Tipos de Vehículo ---
@vehiculos_bp.route("/tipos-vehiculo", methods=["GET"])
def get_tipos_vehiculo():
    tipos = list_tipos_vehiculo()
    return jsonify(tipos), 200

@vehiculos_bp.route("/tipo-vehiculo/<int:id_tipo_vehiculo>", methods=["POST"])
def get_datos_tipo_vehiculo(id_tipo_vehiculo):
    nuevo = datos_tipos_vehiculo(id_tipo_vehiculo)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201


# --- Apis solo para admin ---
@vehiculos_bp.route("/tipos-vehiculo", methods=["POST"])
def post_tipo_vehiculo():
    # Supongamos que solo admin puede; chequear request.user["tipo_usuario"] == "admin"
    payload = request.get_json()
    # Validación básica sin Marshmallow en este ejemplo:
    required = ["nombre", "capacidad_volumen", "capacidad_peso"]
    for r in required:
        if r not in payload:
            return jsonify({"msg": f"'{r}' es obligatorio"}), 400

    nuevo = create_tipo_vehiculo(payload)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201

@vehiculos_bp.route("/tipos-vehiculo/<int:id_tipo_vehiculo>", methods=["PUT"])
def put_tipo_vehiculo(id_tipo_vehiculo):
    payload = request.get_json()
    actualizado = update_tipo_vehiculo(id_tipo_vehiculo, payload)
    if "error" in actualizado:
        return jsonify({"msg": actualizado["error"]}), 400
    return jsonify(actualizado), 200

@vehiculos_bp.route("/tipos-vehiculo/<int:id_tipo_vehiculo>", methods=["DELETE"])
def delete_tipo_vehiculo_route(id_tipo_vehiculo):
    resultado = delete_tipo_vehiculo(id_tipo_vehiculo)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200
