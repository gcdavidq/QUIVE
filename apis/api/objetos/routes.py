from flask import Blueprint, request, jsonify
from api.objetos.services import (
    list_tipos_objeto,
    create_tipo_objeto,
    update_tipo_objeto,
    delete_tipo_objeto,
    list_objetos_de_solicitud,
    add_objeto_a_solicitud,
    update_objeto_de_solicitud,
    delete_objeto_de_solicitud
)
from api.objetos.schemas import TipoObjetoSchema, AddObjetoASolicitudSchema
from marshmallow import ValidationError

objetos_bp = Blueprint("objetos_bp", __name__)

# --- Tipos de Objeto (catálogo) ---
@objetos_bp.route("/tipos-objeto", methods=["GET"])
def get_tipos_objeto():
    tipos = list_tipos_objeto()
    return jsonify(tipos), 200

@objetos_bp.route("/tipos-objeto", methods=["POST"])
def post_tipo_objeto():
    # Admin
    payload = request.get_json()
    schema = TipoObjetoSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    nuevo = create_tipo_objeto(data)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201

@objetos_bp.route("/tipos-objeto/<int:id_tipo>", methods=["PUT"])
def put_tipo_objeto(id_tipo):
    payload = request.get_json()
    schema = TipoObjetoSchema(partial=True)
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    updated = update_tipo_objeto(id_tipo, data)
    if "error" in updated:
        return jsonify({"msg": updated["error"]}), 400
    return jsonify(updated), 200

@objetos_bp.route("/tipos-objeto/<int:id_tipo>", methods=["DELETE"])
def delete_tipo_objeto_route(id_tipo):
    resultado = delete_tipo_objeto(id_tipo)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200

# --- Objetos dentro de una Solicitud ---
@objetos_bp.route("/<int:id_solicitud>/objetos", methods=["GET"])
def get_objetos_solicitud(id_solicitud):
    objetos = list_objetos_de_solicitud(id_solicitud)
    return jsonify(objetos), 200

@objetos_bp.route("/<int:id_solicitud>/objetos", methods=["POST"])
def post_objetos_solicitud(id_solicitud):
    payload = request.get_json()
    schema = AddObjetoASolicitudSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    nuevo = add_objeto_a_solicitud(id_solicitud, data)
    if "error" in nuevo:
        return jsonify({"msg": nuevo["error"]}), 400
    return jsonify(nuevo), 201

@objetos_bp.route("/<int:id_solicitud>/objetos/<int:id_objeto>", methods=["PUT"])
def put_objeto_solicitud(id_solicitud, id_objeto):
    payload = request.get_json()
    schema = AddObjetoASolicitudSchema(partial=True)
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    updated = update_objeto_de_solicitud(id_solicitud, id_objeto, data)
    if "error" in updated:
        return jsonify({"msg": updated["error"]}), 400
    return jsonify(updated), 200

@objetos_bp.route("/<int:id_solicitud>/objetos/<int:id_objeto>", methods=["DELETE"])
def delete_objeto_solicitud(id_solicitud, id_objeto):
    resultado = delete_objeto_de_solicitud(id_solicitud, id_objeto)
    return jsonify(resultado), 200
