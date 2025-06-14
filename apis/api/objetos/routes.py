from flask import Blueprint, request, jsonify
from api.objetos.services import (
    list_tipos_objeto,
    create_tipo_objeto,
    list_objetos_de_solicitud,
    add_objetos_a_solicitud,
    delete_objetos_de_solicitud
)
from api.objetos.schemas import TipoObjetoSchema, AddObjetoASolicitudSchema
from utils.quickstart import subir_a_dropbox
from marshmallow import ValidationError
from concurrent.futures import ThreadPoolExecutor, as_completed

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

# --- Objetos dentro de una Solicitud ---
@objetos_bp.route("/<int:id_solicitud>/objetos", methods=["GET"])
def get_objetos_solicitud(id_solicitud):
    objetos = list_objetos_de_solicitud(id_solicitud)
    return jsonify(objetos), 200

@objetos_bp.route("/<int:id_solicitud>/objetos", methods=["POST"])
def post_objetos_solicitud(id_solicitud):
    payload = []
    i = 0
    # Paso 1: recolectar los datos primero (sin subir aún)
    objetos_temp = []
    while f'objetos[{i}][id_tipo]' in request.form:
        id_tipo = request.form.get(f'objetos[{i}][id_tipo]')
        cantidad = request.form.get(f'objetos[{i}][cantidad]')
        imagen_file = request.files.get(f'objetos[{i}][imagen_file]')
        imagen_url = request.form.get(f'objetos[{i}][imagen_url]')
        objetos_temp.append({
            "id_tipo": id_tipo,
            "cantidad": cantidad,
            "imagen_file": imagen_file,
            "imagen_url": imagen_url,
        })
        i += 1
    try:
        delete_objetos_de_solicitud(id_solicitud)
    except Exception as e:
        return jsonify({"msg": f"Error al eliminar objetos anteriores: {str(e)}"}), 500
    # Paso 2: función para procesar cada objeto
    def procesar_objeto(obj):
        if obj["imagen_file"]:
            obj["imagen_url"] = subir_a_dropbox(obj["imagen_file"], f"/{obj['imagen_file'].filename}")
        return {
            "id_tipo": obj["id_tipo"],
            "cantidad": obj["cantidad"],
            "imagen_url": obj["imagen_url"],
        }

    # Paso 3: ejecutar en paralelo
    with ThreadPoolExecutor(max_workers=5) as executor:  # puedes ajustar el número de workers
        futures = [executor.submit(procesar_objeto, obj) for obj in objetos_temp]
        for future in as_completed(futures):
            payload.append(future.result())
    schema = AddObjetoASolicitudSchema()
    data = []
    for objet in payload:
        try:
            data.append(schema.load(objet))
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400
    nuevo = add_objetos_a_solicitud(id_solicitud, data)
    if isinstance(nuevo, dict) and "error" in nuevo:
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
