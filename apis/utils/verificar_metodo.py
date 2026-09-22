from db import get_db

ALLOWED_TABLES = {
    "tarjeta": "tarjeta",
    "yape": "yape",
    "paypal": "paypal",
}


def _normalize_table(tipo: str) -> str | None:
    if not tipo:
        return None
    return ALLOWED_TABLES.get(tipo.strip().lower())


def obtener_detalle_metodo_externo(tipo: str, id_metodo: int):
    table = _normalize_table(tipo)
    if not table:
        return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table} WHERE id = %s", (id_metodo,))
    return cursor.fetchone()


def transferir_fondos(origen_tipo: str, origen_id: int, destino_tipo: str, destino_id: int, monto: float):
    table_orig = _normalize_table(origen_tipo)
    table_dest = _normalize_table(destino_tipo)

    if not table_orig:
        return f"Tipo de método de origen no válido: {origen_tipo}"
    if not table_dest:
        return f"Tipo de método de destino no válido: {destino_tipo}"

    conn = get_db()
    cursor = conn.cursor()

    try:
        # Obtener saldo de origen
        cursor.execute(f"SELECT saldo FROM {table_orig} WHERE id = %s", (origen_id,))
        origen = cursor.fetchone()
        if not origen:
            return f"{origen_tipo} con ID {origen_id} no existe"

        if float(origen["saldo"]) < float(monto):
            return "Saldo insuficiente"

        # Obtener destino
        cursor.execute(f"SELECT saldo FROM {table_dest} WHERE id = %s", (destino_id,))
        destino = cursor.fetchone()
        if not destino:
            return f"{destino_tipo} con ID {destino_id} no existe"

        # Realizar transferencia
        cursor.execute(
            f"UPDATE {table_orig} SET saldo = saldo - %s WHERE id = %s",
            (monto, origen_id)
        )
        cursor.execute(
            f"UPDATE {table_dest} SET saldo = saldo + %s WHERE id = %s",
            (monto, destino_id)
        )
        conn.commit()
        return f"Transferencia de {monto} de {origen_tipo}({origen_id}) a {destino_tipo}({destino_id}) realizada"
    except Exception as e:
        conn.rollback()
        return f"Error en transferencia: {str(e)}"


def obtener_id_metodo_pago(tipo: str, datos: dict):
    table = _normalize_table(tipo)
    if not table or not datos:
        return None

    conn = get_db()
    cursor = conn.cursor()

    if table == "tarjeta":
        cursor.execute("""
            SELECT id FROM tarjeta
            WHERE numero = %s AND cvv = %s AND vencimiento = %s AND activo = TRUE
        """, (datos.get("numero"), datos.get("cvv"), datos.get("vencimiento")))
    elif table == "yape":
        cursor.execute("""
            SELECT id FROM yape
            WHERE codigo = %s AND activo = TRUE
        """, (datos.get("codigo"),))
    elif table == "paypal":
        pass_val = datos.get("contrasena") or datos.get("contraseña")
        cursor.execute("""
            SELECT id FROM paypal
            WHERE correo = %s AND contrasena = %s AND activo = TRUE
        """, (datos.get("correo"), pass_val))
    else:
        return None

    resultado = cursor.fetchone()
    return resultado["id"] if resultado else None


# ============================================================
# Alta de métodos en la pasarela SIMULADA
# ============================================================
# QUIVE no está conectado a una pasarela real. Para que cualquier usuario pueda probar
# el flujo completo, registrar un método crea su fila en la pasarela simulada con un
# saldo inicial FICTICIO. La interfaz lo declara así; no es dinero real.
import re
from datetime import date

from utils.security import hash_password, check_password

SALDO_INICIAL_SIMULADO = 5000.00


def _validar_datos_simulados(table: str, datos: dict):
    """Devuelve (datos_normalizados, error)."""
    if table == "tarjeta":
        numero = re.sub(r"\D", "", str(datos.get("numero") or ""))
        cvv = str(datos.get("cvv") or "")
        vencimiento = str(datos.get("vencimiento") or "").strip()
        if not 13 <= len(numero) <= 19:
            return None, "El número de tarjeta debe tener entre 13 y 19 dígitos"
        if not re.fullmatch(r"\d{3,4}", cvv):
            return None, "El CVV debe tener 3 o 4 dígitos"
        m = re.fullmatch(r"(0[1-9]|1[0-2])/(\d{2})", vencimiento)
        if not m:
            return None, "El vencimiento debe tener el formato MM/AA"
        mes, anio = int(m.group(1)), 2000 + int(m.group(2))
        hoy = date.today()
        if (anio, mes) < (hoy.year, hoy.month):
            return None, "La tarjeta está vencida"
        return {"numero": numero, "cvv": cvv, "vencimiento": vencimiento}, None

    if table == "yape":
        codigo = str(datos.get("codigo") or "").strip().upper()
        if not re.fullmatch(r"[A-Z0-9]{4,30}", codigo):
            return None, "El código Yape debe tener de 4 a 30 letras o números"
        return {"codigo": codigo}, None

    correo = str(datos.get("correo") or "").strip().lower()
    contrasena = str(datos.get("contrasena") or datos.get("contraseña") or "")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", correo):
        return None, "El correo de PayPal no es válido"
    if len(contrasena) < 4:
        return None, "La contraseña debe tener al menos 4 caracteres"
    return {"correo": correo, "contrasena": contrasena}, None


def _credenciales_coinciden(table: str, fila: dict, datos: dict) -> bool:
    if table == "tarjeta":
        return fila["cvv"] == datos["cvv"] and fila["vencimiento"] == datos["vencimiento"]
    if table == "paypal":
        guardada = fila["contrasena"] or ""
        # Las filas del seed guardan la contraseña en claro; las creadas desde la app, con bcrypt.
        if guardada.startswith("$2"):
            return check_password(datos["contrasena"], guardada)
        return guardada == datos["contrasena"]
    return True  # Yape no tiene secreto: lo protege la regla de "un solo dueño" de abajo


def obtener_o_crear_metodo_simulado(tipo: str, datos: dict, usuario_id: int):
    """
    Devuelve (id_metodo_externo, error).
    - Si el identificador (número / código / correo) ya existe en la pasarela: las credenciales
      deben coincidir y no puede estar vinculado a OTRO usuario (nadie se apropia del método de otro).
    - Si no existe: se crea a nombre del usuario con SALDO_INICIAL_SIMULADO.
    """
    table = _normalize_table(tipo)
    if not table:
        return None, "Tipo de método no válido"
    datos, error = _validar_datos_simulados(table, datos or {})
    if error:
        return None, error

    columna = {"tarjeta": "numero", "yape": "codigo", "paypal": "correo"}[table]
    cursor = get_db().cursor()
    cursor.execute(f"SELECT * FROM {table} WHERE LOWER({columna}) = LOWER(%s)", (datos[columna],))
    fila = cursor.fetchone()

    if fila:
        if not fila["activo"]:
            return None, "Ese método está inactivo en la pasarela"
        if not _credenciales_coinciden(table, fila, datos):
            return None, "Los datos no coinciden con los de ese método"
        cursor.execute("""
            SELECT 1 FROM Metodos_Pago_Usuario
            WHERE LOWER(tipo_metodo) = %s AND id_metodo_externo = %s AND usuario_id <> %s
            LIMIT 1
        """, (table, fila["id"], usuario_id))
        if cursor.fetchone():
            return None, "Ese método ya está vinculado a otra cuenta"
        return fila["id"], None

    cursor.execute("SELECT nombre_completo FROM Usuarios WHERE id_usuario = %s", (usuario_id,))
    titular = cursor.fetchone()["nombre_completo"]

    if table == "tarjeta":
        cursor.execute("""
            INSERT INTO tarjeta (numero, cvv, vencimiento, titular, saldo, activo)
            VALUES (%s, %s, %s, %s, %s, TRUE) RETURNING id
        """, (datos["numero"], datos["cvv"], datos["vencimiento"], titular, SALDO_INICIAL_SIMULADO))
    elif table == "yape":
        cursor.execute("""
            INSERT INTO yape (codigo, titular, saldo, activo)
            VALUES (%s, %s, %s, TRUE) RETURNING id
        """, (datos["codigo"], titular, SALDO_INICIAL_SIMULADO))
    else:
        cursor.execute("""
            INSERT INTO paypal (correo, contrasena, titular, saldo, activo)
            VALUES (%s, %s, %s, %s, TRUE) RETURNING id
        """, (datos["correo"], hash_password(datos["contrasena"]), titular, SALDO_INICIAL_SIMULADO))
    return cursor.fetchone()["id"], None
