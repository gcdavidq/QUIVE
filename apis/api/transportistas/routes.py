from flask import Blueprint, request, jsonify, session
from api.transportistas.services import (
    upload_or_update_my_documentos,
    get_documentos_by_id,
    list_transportistas_verified,
    create_tarifa,
    update_tarifa,
    get_tarifa_by_transportista
)
from api.transportistas.schemas import DocumentosSchema, VerificacionSchema, TarifaSchema
from utils.quickstart import subir_a_dropbox
from marshmallow import ValidationError
import concurrent.futures

transportistas_bp = Blueprint("transportistas_bp", __name__)

@transportistas_bp.route("/me/documentos", methods=["POST"])
def post_me_documentos():
    schema = DocumentosSchema()
    licencia = request.files['licencia_conducir_url']
    tarjeta = request.files['tarjeta_propiedad_url']
    certificado = request.files['certificado_itv_url']
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            "licencia_conducir_url": executor.submit(subir_a_dropbox, licencia, f"/{licencia.filename}"),
            "tarjeta_propiedad_url": executor.submit(subir_a_dropbox, tarjeta, f"/{tarjeta.filename}"),
            "certificado_itv_url": executor.submit(subir_a_dropbox, certificado, f"/{certificado.filename}"),
        }
        payload = {k: f.result() for k, f in futures.items()}
    try:
        if not payload:
            return jsonify({"msg": "No se subió ningún documento válido."}), 400
        payload['id_usuario'] = request.form.get('id_usuario')
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = upload_or_update_my_documentos(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201


@transportistas_bp.route("/<int:id_usuario>/documentos", methods=["GET"])
def get_by_id_documentos(id_usuario):
    # Admin o propio transportista
    documentos = get_documentos_by_id(id_usuario)
    if not documentos:
        return jsonify({"msg": "No existen documentos para ese usuario"}), 404
    return jsonify(documentos), 200


@transportistas_bp.route("<int:id_solicitud>/<string:cantidad>", methods=["GET"])
def get_transportistas(id_solicitud, cantidad):
    # En este ejemplo ignoramos los filtros y devolvemos todos los verificados
    resultado = list_transportistas_verified(id_solicitud)
    if cantidad=="unico":
        return jsonify(resultado[0]), 200
    elif cantidad=="all":
        return jsonify(resultado), 200
#<------------------------Tarifas------------------------------->

@transportistas_bp.route("/me/tarifa", methods=["POST"])
def post_tarifa():
    payload = request.get_json()
    schema = TarifaSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = create_tarifa(data)
    return jsonify(resultado), 201

@transportistas_bp.route("/me/tarifa/<int:id_transportista>", methods=["PUT"])
def put_tarifa(id_transportista):
    payload = request.get_json()
    schema = TarifaSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    data['id_transportista']= id_transportista
    resultado = update_tarifa(data)
    return jsonify(resultado), 201


@transportistas_bp.route("/<int:id_usuario>/tarifa", methods=["GET"])
def get_tarifa_by_id(id_usuario):
    resultado = get_tarifa_by_transportista(id_usuario)
    if not resultado:
        return jsonify({"msg": "No hay tarifa registrada para este transportista"}), 404
    return jsonify(resultado), 200
