from db import get_db

def create_pago_min(id_asignacion: int, receptor_id: int, tipo_metodo_receptor: str):
    """
    Crea un nuevo registro en Pagos con solo id_asignacion y receptor_id.
    """
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        INSERT INTO Pagos (id_asignacion, receptor_id, tipo_metodo_receptor)
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (id_asignacion, receptor_id, tipo_metodo_receptor))
    conn.commit()
    return cursor.lastrowid  # devuelve el id_pago creado


def update_pago_by_asignacion(
    id_asignacion: int,
    monto_total: float,
    pagador_id: int,
    tipo_metodo_pagador: str
):
    """
    Completa los datos restantes de un Pago existente,
    identificado por id_asignacion.
    Solo actualiza los campos que no sean None.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Construir dinámicamente la parte SET según los parámetros no nulos
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
        return False  # nada que actualizar

    sql = f"""
        UPDATE Pagos
        SET {', '.join(campos)}
        WHERE id_asignacion = %s
    """
    valores.append(id_asignacion)
    cursor.execute(sql, tuple(valores))
    conn.commit()
    return cursor.rowcount  # número de filas afectadas


def get_pago_by_asignacion(id_asignacion: int):
    """
    Recupera el registro de Pagos asociado a una asignación.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)  # dictionary=True para obtener dicts
    sql = "SELECT * FROM Pagos WHERE id_asignacion = %s"
    cursor.execute(sql, (id_asignacion,))
    return cursor.fetchone()  # devuelve un dict o None si no existe