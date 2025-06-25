import pymysql

def get_connection_pago():
    return pymysql.connect(
        host='shuttle.proxy.rlwy.net',
        user='root',
        password='qkyfZKcPADflYbTCXdQnYjqqIEmfaehT',
        port= 51498,
        db='pasarela_pagos',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def obtener_detalle_metodo_externo(tipo, id_metodo):
    conn = get_connection_pago()
    try:
        with conn.cursor() as cursor:
            if tipo == "Tarjeta":
                cursor.execute("""
                    SELECT * FROM Tarjeta WHERE id = %s
                """, (id_metodo,))
            elif tipo == "Yape":
                cursor.execute("""
                    SELECT * FROM Yape WHERE id = %s
                """, (id_metodo,))
            elif tipo == "PayPal":
                cursor.execute("""
                    SELECT * FROM PayPal WHERE id = %s
                """, (id_metodo,))
            else:
                return None
            return cursor.fetchone()
    finally:
        conn.close()

def transferir_fondos(origen_tipo, origen_id, destino_tipo, destino_id, monto):
    conn = get_connection_pago()
    try:
        with conn.cursor() as cursor:
            # Obtener saldo de origen
            cursor.execute(f"SELECT saldo FROM {origen_tipo} WHERE id = %s", (origen_id,))
            origen = cursor.fetchone()
            if not origen:
                return f"{origen_tipo} con ID {origen_id} no existe"

            if origen['saldo'] < monto:
                return "Saldo insuficiente"

            # Obtener destino
            cursor.execute(f"SELECT saldo FROM {destino_tipo} WHERE id = %s", (destino_id,))
            destino = cursor.fetchone()
            if not destino:
                return f"{destino_tipo} con ID {destino_id} no existe"

            # Realizar transferencia
            cursor.execute(f"UPDATE {origen_tipo} SET saldo = saldo - %s WHERE id = %s", (monto, origen_id))
            cursor.execute(f"UPDATE {destino_tipo} SET saldo = saldo + %s WHERE id = %s", (monto, destino_id))
            conn.commit()
            return f"Transferencia de {monto} de {origen_tipo}({origen_id}) a {destino_tipo}({destino_id}) realizada"
    finally:
        conn.close()

def obtener_id_metodo_pago(tipo, datos):
    conn = get_connection_pago()
    try:
        with conn.cursor() as cursor:
            if tipo == "Tarjeta":
                cursor.execute("""
                    SELECT id FROM Tarjeta
                    WHERE numero = %s AND cvv = %s AND vencimiento = %s
                """, (datos.get("numero"), datos.get("cvv"), datos.get("vencimiento")))
            elif tipo == "Yape":
                cursor.execute("""
                    SELECT id FROM Yape
                    WHERE codigo = %s AND activo = TRUE
                """, (datos.get("codigo"),))
            elif tipo == "PayPal":
                cursor.execute("""
                    SELECT id FROM PayPal
                    WHERE correo = %s AND contraseña = %s
                """, (datos.get("correo"), datos.get("contraseña")))
            else:
                return None

            resultado = cursor.fetchone()
            return resultado["id"] if resultado else None
    finally:
        conn.close()