"""
Script para actualizar y verificar las contraseñas de los usuarios demo en Neon PostgreSQL.
Establece 'password123' como contraseña con un hash bcrypt válido.
"""

import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from db import get_db_connection
from utils.security import hash_password, check_password


def fix_demo_users_passwords(plain_password="password123"):
    print(f"[*] Generando hash bcrypt para la clave: '{plain_password}'...")
    valid_hash = hash_password(plain_password)
    print(f"[+] Hash generado: {valid_hash}")

    # Verificar localmente
    assert check_password(plain_password, valid_hash), "Error validando hash generado"
    print("[+] Validación local exitosa.")

    print("[*] Conectando a PostgreSQL (Neon)...")
    conn = get_db_connection()
    cursor = conn.cursor()

    demo_emails = [
        "carlos@demo.com",
        "maria@demo.com",
        "juan@demo.com",
        "pedro@demo.com",
        "ana@demo.com",
        "admin@demo.com",
    ]

    # Actualizar hashes de los usuarios existentes
    cursor.execute("""
        UPDATE Usuarios
        SET contrasena_hash = %s, estado_cuenta = 'activo'
        WHERE email = ANY(%s)
        RETURNING id_usuario, nombre_completo, email, tipo_usuario;
    """, (valid_hash, demo_emails))

    actualizados = cursor.fetchall()
    print(f"[+] Usuarios actualizados en BD ({len(actualizados)}):")
    for u in actualizados:
        print(f"    - ID {u['id_usuario']}: {u['nombre_completo']} ({u['email']}) -> Rol: {u['tipo_usuario']}")

    # Si admin@demo.com no existe, insertarlo
    cursor.execute("SELECT id_usuario FROM Usuarios WHERE email = 'admin@demo.com'")
    admin = cursor.fetchone()
    if not admin:
        cursor.execute("""
            INSERT INTO Usuarios (nombre_completo, email, telefono, dni, contrasena_hash, ubicacion, tipo_usuario, estado_cuenta, foto_perfil_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_usuario;
        """, (
            "Admin QUIVE", "admin@demo.com", "+51999888777", "00000000",
            valid_hash, "Sede Central QUIVE, San Isidro, Lima, Peru", "admin", "activo", ""
        ))
        nuevo_admin = cursor.fetchone()
        print(f"[+] Creado usuario administrador demo con ID {nuevo_admin['id_usuario']}")

    conn.close()
    print("\n[OK] Todas las cuentas demo ahora tienen la contrasena: " + plain_password)
    return valid_hash


if __name__ == "__main__":
    fix_demo_users_passwords()
