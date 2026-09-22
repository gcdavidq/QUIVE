from flask import Blueprint, request, jsonify
from api.vehiculos.services import (
    list_my_vehiculos,
    create_my_vehiculo,
    check_placa_exists,
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
from utils.auth import requiere_auth, id_actual, rol_actual, es_propio, prohibido, rol_en_solicitud, rol_en_asignacion

vehiculos_bp = Blueprint("vehiculos_bp", __name__)

# --- Vehículos del transportista ---
@vehiculos_bp.route("/me/<int:id_usuario>", methods=["GET"])
@requiere_auth("transportista")
def get_me_vehiculos(id_usuario):
    if not es_propio(id_usuario):
        return prohibido()
    vehs = list_my_vehiculos(id_actual())
    return jsonify(vehs), 200

@vehiculos_bp.route("/verificar-placa", methods=["POST"])
def verificar_placa():
    data = request.get_json()
    if not data or "placa" not in data:
        return jsonify({"msg": "Placa es requerida"}), 400

    existe = check_placa_exists(data["placa"])
    return jsonify({"existe": existe}), 200

@vehiculos_bp.route("/me", methods=["POST"])
@requiere_auth("transportista")
def post_me_vehiculo():
    payload = request.form.to_dict()
    # El vehículo siempre se registra a nombre del transportista autenticado.
    payload['id_usuario'] = str(id_actual())
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
@requiere_auth("transportista")
def put_me_vehiculo(id_vehiculo):
    payload = request.get_json()
    schema = UpdateVehiculoSchema()
    try:
        data = schema.load(payload, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    data['id_usuario'] = id_actual()
    actualizado = update_my_vehiculo(id_vehiculo, data)
    if "error" in actualizado:
        return jsonify({"msg": actualizado["error"]}), 400
    return jsonify(actualizado), 200

@vehiculos_bp.route("/me/<int:id_vehiculo>/<int:id_usuario>", methods=["DELETE"])
@requiere_auth("transportista")
def delete_me_vehiculo(id_vehiculo, id_usuario):
    if not es_propio(id_usuario):
        return prohibido()
    resultado = delete_my_vehiculo(id_vehiculo, id_actual())
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
@requiere_auth("admin")
def post_tipo_vehiculo():
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
@requiere_auth("admin")
def put_tipo_vehiculo(id_tipo_vehiculo):
    payload = request.get_json()
    actualizado = update_tipo_vehiculo(id_tipo_vehiculo, payload)
    if "error" in actualizado:
        return jsonify({"msg": actualizado["error"]}), 400
    return jsonify(actualizado), 200

@vehiculos_bp.route("/tipos-vehiculo/<int:id_tipo_vehiculo>", methods=["DELETE"])
@requiere_auth("admin")
def delete_tipo_vehiculo_route(id_tipo_vehiculo):
    resultado = delete_tipo_vehiculo(id_tipo_vehiculo)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200
