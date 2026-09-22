from flask import Blueprint, request, jsonify
from utils.auth import requiere_auth, id_actual, rol_actual, es_propio, prohibido, rol_en_solicitud, rol_en_asignacion
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
@requiere_auth("transportista")
def post_me_documentos():
    schema = DocumentosSchema()
    licencia = request.files.get('licencia_conducir_url')
    tarjeta = request.files.get('tarjeta_propiedad_url')
    certificado = request.files.get('certificado_itv_url')
    if not (licencia and tarjeta and certificado):
        return jsonify({"msg": "Debes adjuntar licencia, tarjeta de propiedad y certificado ITV."}), 400
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
        # Los documentos siempre se registran a nombre del transportista autenticado.
        payload['id_usuario'] = str(id_actual())
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    resultado = upload_or_update_my_documentos(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201


@transportistas_bp.route("/<int:id_usuario>/documentos", methods=["GET"])
@requiere_auth("transportista", "admin")
def get_by_id_documentos(id_usuario):
    # Admin o propio transportista
    if rol_actual() != "admin" and not es_propio(id_usuario):
        return prohibido()
    documentos = get_documentos_by_id(id_usuario)
    if not documentos:
        return jsonify({"msg": "No existen documentos para ese usuario"}), 404
    return jsonify(documentos), 200


@transportistas_bp.route("<int:id_solicitud>/<string:cantidad>", methods=["GET"])
@requiere_auth("cliente")
def get_transportistas(id_solicitud, cantidad):
    if rol_en_solicitud(id_solicitud) != "cliente":
        return prohibido("Solo puedes cotizar transportistas para tus propias solicitudes")
    resultado = list_transportistas_verified(id_solicitud)
    if cantidad == "unico":
        if not resultado:
            return jsonify({"msg": "No hay transportistas disponibles para esta solicitud"}), 404
        return jsonify(resultado[0]), 200
    elif cantidad == "all":
        return jsonify(resultado), 200
    return jsonify({"msg": "Parámetro no válido"}), 400
#<------------------------Tarifas------------------------------->

@transportistas_bp.route("/me/tarifa", methods=["POST"])
@requiere_auth("transportista")
def post_tarifa():
    payload = request.get_json()
    schema = TarifaSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    data['id_transportista'] = id_actual()
    resultado = create_tarifa(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 201

@transportistas_bp.route("/me/tarifa/<int:id_transportista>", methods=["PUT"])
@requiere_auth("transportista")
def put_tarifa(id_transportista):
    payload = request.get_json()
    schema = TarifaSchema()
    try:
        data = schema.load(payload)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
    if not es_propio(id_transportista):
        return prohibido()
    data['id_transportista'] = id_actual()
    resultado = update_tarifa(data)
    if "error" in resultado:
        return jsonify({"msg": resultado["error"]}), 400
    return jsonify(resultado), 200


@transportistas_bp.route("/<int:id_usuario>/tarifa", methods=["GET"])
@requiere_auth()
def get_tarifa_by_id(id_usuario):
    resultado = get_tarifa_by_transportista(id_usuario)
    if not resultado:
        return jsonify({"msg": "No hay tarifa registrada para este transportista"}), 404
    return jsonify(resultado), 200
