from db import get_db
from utils.verificar_metodo import (
    obtener_o_crear_metodo_simulado,
    obtener_detalle_metodo_externo
)

def _detalle_publico(tipo: str, detalle: dict) -> dict:
    """
    Lo único que la UI necesita para identificar un método. Nunca salen del backend
    el número completo, el CVV ni la contraseña de PayPal.
    """
    if not detalle:
        return {}
    publico = {
        "titular": detalle.get("titular"),
        "activo": detalle.get("activo"),
        # Saldo FICTICIO de la pasarela simulada; solo lo ve su dueño.
        "saldo_simulado": float(detalle["saldo"]) if detalle.get("saldo") is not None else None,
    }
    tipo = (tipo or "").lower()
    if tipo == "tarjeta":
        numero = str(detalle.get("numero") or "")
        publico["ultimos4"] = numero[-4:]
        publico["vencimiento"] = detalle.get("vencimiento")
    elif tipo == "yape":
        publico["codigo"] = detalle.get("codigo")
    elif tipo == "paypal":
        publico["correo"] = detalle.get("correo")
    return publico


def listar_metodos_pago_usuario(usuario_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, tipo_metodo, id_metodo_externo FROM Metodos_Pago_Usuario
        WHERE usuario_id = %s
    """, (usuario_id,))
    metodos = cursor.fetchall()

    resultado = []
    for metodo in metodos:
        detalle = obtener_detalle_metodo_externo(metodo["tipo_metodo"], metodo["id_metodo_externo"])
        resultado.append({
            "id": metodo["id"],
            "tipo": metodo["tipo_metodo"],
            "detalle": _detalle_publico(metodo["tipo_metodo"], detalle)
        })

    return resultado


def registrar_metodo_pago_usuario(usuario_id, tipo, datos):
    """Devuelve (ok, mensaje)."""
    id_metodo, error = obtener_o_crear_metodo_simulado(tipo, datos, usuario_id)
    if error:
        return False, error

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 1 FROM Metodos_Pago_Usuario
        WHERE usuario_id = %s AND tipo_metodo = %s AND id_metodo_externo = %s
    """, (usuario_id, tipo, id_metodo))
    if cursor.fetchone():
        return False, "El método de pago ya está registrado para este usuario"

    cursor.execute("""
        INSERT INTO Metodos_Pago_Usuario (usuario_id, tipo_metodo, id_metodo_externo)
        VALUES (%s, %s, %s)
    """, (usuario_id, tipo, id_metodo))
    return True, "Método de pago registrado correctamente"


def actualizar_metodo_pago_usuario(id_metodo_usuario, usuario_id, tipo, datos):
    """Solo el dueño puede actualizar su método. Devuelve (ok, mensaje)."""
    id_metodo_nuevo, error = obtener_o_crear_metodo_simulado(tipo, datos, usuario_id)
    if error:
        return False, error

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE Metodos_Pago_Usuario
        SET tipo_metodo = %s, id_metodo_externo = %s
        WHERE id = %s AND usuario_id = %s
    """, (tipo, id_metodo_nuevo, id_metodo_usuario, usuario_id))
    if cursor.rowcount == 0:
        return False, "No se encontró el método a actualizar"
    return True, "Método de pago actualizado correctamente"


def eliminar_metodo_pago_usuario(id_metodo_usuario, usuario_id):
    """Solo el dueño puede eliminar su método. Devuelve (ok, mensaje)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM Metodos_Pago_Usuario WHERE id = %s AND usuario_id = %s
    """, (id_metodo_usuario, usuario_id))
    if cursor.rowcount == 0:
        return False, "No se encontró el método a eliminar"
    return True, "Método de pago eliminado correctamente"
