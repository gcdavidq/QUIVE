import os
from datetime import timedelta

# Si quieres usar un .env, uncomment las dos líneas siguientes:
# from dotenv import load_dotenv
# load_dotenv()

class Config:
    # ====== MySQL ======
    DB_HOST = os.getenv("DB_HOST", "tramway.proxy.rlwy.net")
    DB_PORT = int(os.getenv("DB_PORT", 27353))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "csbMTGDfyqRzbyWHEvyllSEVSRXsOrqg")
    DB_NAME = os.getenv("DB_NAME", "quive")

    SESSION_COOKIE_HTTPONLY=True
    SESSION_COOKIE_SAMESITE='None'
    SESSION_COOKIE_SECURE = False

    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_PERMANENT = True


# Instancia global de configuración
config = Config()
