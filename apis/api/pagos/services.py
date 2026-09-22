from db import get_db
from utils.verificar_metodo import transferir_fondos


def create_pago_min(id_asignacion: int, receptor_id: int, tipo_metodo_receptor: str):
    """Crea un nuevo registro en Pagos con solo id_asignacion y receptor_id."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Pagos (id_asignacion, receptor_id, tipo_metodo_receptor)
        VALUES (%s, %s, %s)
        RETURNING id_pago
    """, (id_asignacion, receptor_id, tipo_metodo_receptor))
    return cursor.fetchone()["id_pago"]


def update_pago_by_asignacion(id_asignacion: int, monto_total: float, pagador_id: int, tipo_metodo_pagador: str):
    """
    Completa los datos restantes de un Pago existente.
    Luego recupera la fila completa y transfiere fondos.
    """
    conn = get_db()
    cursor = conn.cursor()

    campos = []
    valores = []
    if monto_total is not None:
        campos.append("monto_total = %s")
        valores.append(monto_total)
    if pagador_id is not None:
        campos.append("pagador_id = %s")
        valores.append(pagador_id)
    if tipo_metodo_pagador is not None:
        campos.append("tipo_metodo_pagador = %s")
        valores.append(tipo_metodo_pagador)

    if not campos:
        return False

    sql = f"UPDATE Pagos SET {', '.join(campos)} WHERE id_asignacion = %s"
    valores.append(id_asignacion)
    cursor.execute(sql, tuple(valores))

    # Obtener la fila actualizada
    cursor.execute("SELECT * FROM Pagos WHERE id_asignacion = %s", (id_asignacion,))
    pago = cursor.fetchone()

    if not pago:
        raise ValueError("Pago no encontrado")

    # Recuperar los id_metodo_externo
    cursor.execute("""
        SELECT id, id_metodo_externo
        FROM Metodos_Pago_Usuario
        WHERE id IN (%s, %s)
    """, (pago['pagador_id'], pago['receptor_id']))
    metodos = cursor.fetchall()

    id_metodo_externo_pagador = None
    id_metodo_externo_receptor = None
    for metodo in metodos:
        if metodo['id'] == pago['pagador_id']:
            id_metodo_externo_pagador = metodo['id_metodo_externo']
        elif metodo['id'] == pago['receptor_id']:
            id_metodo_externo_receptor = metodo['id_metodo_externo']

    if id_metodo_externo_pagador is None or id_metodo_externo_receptor is None:
        raise ValueError("No se encontraron los métodos de pago externos requeridos")

    resultado = transferir_fondos(
        pago['tipo_metodo_pagador'],
        id_metodo_externo_pagador,
        pago['tipo_metodo_receptor'],
        id_metodo_externo_receptor,
        pago['monto_total']
    )
    # transferir_fondos informa el resultado como texto; antes se ignoraba y un
    # "Saldo insuficiente" dejaba el servicio como pagado.
    exito = isinstance(resultado, str) and resultado.startswith("Transferencia de")
    cursor.execute("UPDATE Pagos SET estado_pago = %s WHERE id_asignacion = %s",
                   ('completado' if exito else 'fallido', id_asignacion))
    if not exito:
        raise ValueError(resultado or "No se pudo procesar el pago")

    pago['estado_pago'] = 'completado'
    return pago


def get_pago_by_asignacion(id_asignacion: int):
    """Recupera el registro de Pagos asociado a una asignación."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Pagos WHERE id_asignacion = %s", (id_asignacion,))
    return cursor.fetchone()
