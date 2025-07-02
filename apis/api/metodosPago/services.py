from db import get_db
from utils.verficar_metodo import (
    obtener_id_metodo_pago,
    transferir_fondos,
    obtener_detalle_metodo_externo)


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
            "detalle": detalle or {}
        })

    return resultado

def registrar_metodo_pago_usuario(usuario_id, tipo, datos):
    id_metodo = obtener_id_metodo_pago(tipo, datos)
    if not id_metodo:
        return f"El método de pago de tipo {tipo} no es válido o no está activo"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM Metodos_Pago_Usuario
        WHERE usuario_id = %s AND tipo_metodo = %s AND id_metodo_externo = %s
    """, (usuario_id, tipo, id_metodo))
    if cursor.fetchone():
        return "El método de pago ya está registrado para este usuario"

    cursor.execute("""
        INSERT INTO Metodos_Pago_Usuario (usuario_id, tipo_metodo, id_metodo_externo)
        VALUES (%s, %s, %s)
    """, (usuario_id, tipo, id_metodo))
    return "Método de pago registrado correctamente"

def actualizar_metodo_pago_usuario(id_metodo_usuario, tipo, datos):
    id_metodo_nuevo = obtener_id_metodo_pago(tipo, datos)
    if not id_metodo_nuevo:
        return f"El nuevo método de pago no es válido o no está activo"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE Metodos_Pago_Usuario
        SET tipo_metodo = %s, id_metodo_externo = %s
        WHERE id = %s
    """, (tipo, id_metodo_nuevo, id_metodo_usuario))
    if cursor.rowcount == 0:
        return "No se encontró el método a actualizar"
    return "Método de pago actualizado correctamente"

def eliminar_metodo_pago_usuario(id_metodo_usuario):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM Metodos_Pago_Usuario WHERE id = %s
    """, (id_metodo_usuario,))
    if cursor.rowcount == 0:
        return "No se encontró el método a eliminar"
    return "Método de pago eliminado correctamente"

def realizar_pago_con_metodo(origen_usuario_id, tipo_metodo, id_metodo_externo, destino_tipo, destino_id, monto):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM Metodos_Pago_Usuario
        WHERE usuario_id = %s AND tipo_metodo = %s AND id_metodo_externo = %s
    """, (origen_usuario_id, tipo_metodo, id_metodo_externo))
    if not cursor.fetchone():
        return "Este método no pertenece al usuario o no está registrado"

    return transferir_fondos(tipo_metodo, id_metodo_externo, destino_tipo, destino_id, monto)