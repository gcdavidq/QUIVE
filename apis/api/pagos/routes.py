from flask import Blueprint, jsonify
from api.pagos.services import get_pago_by_asignacion
from utils.auth import requiere_auth, prohibido, rol_en_asignacion

pagos_bp = Blueprint("pagos_bp", __name__)

# Los pagos no se crean ni se liquidan desde una API pública:
#   - el registro del pago (lado receptor) lo crea el transportista al aceptar
#     la asignación  -> POST /asignaciones/<id>/respuesta
#   - la liquidación (lado pagador) la dispara el cliente al confirmar la solicitud
#     -> PUT /solicitudes/actualizar_estado/<id>
# Los antiguos POST/PATCH /pagos/pagos duplicaban esa lógica sin validar quién
# pagaba ni cuánto, por lo que se retiraron.


@pagos_bp.route("/pagos/<int:id_asignacion>", methods=["GET"])
@requiere_auth("cliente", "transportista")
def get_pago_route(id_asignacion):
    """
    Obtiene el pago asociado a la asignación dada (solo las partes de la asignación).
    """
    if rol_en_asignacion(id_asignacion) is None:
        return prohibido()
    pago = get_pago_by_asignacion(id_asignacion)
    if pago:
        return jsonify(pago), 200
    return jsonify({'message': 'Pago not found.'}), 404
