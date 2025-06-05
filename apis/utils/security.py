import bcrypt
import datetime
from flask import current_app

# ----- Funciones para contraseñas -----
def hash_password(plain_password: str) -> str:
    """
    Hashea la contraseña con bcrypt y devuelve el hash (string).
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def check_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si la contraseña en plano coincide con el hash bcrypt.
    """
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))