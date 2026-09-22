import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ====== PostgreSQL (Neon) ======
    DATABASE_URL = os.getenv("DATABASE_URL")

    # ====== Flask ======
    # .env.example documenta SECRET_KEY; se mantiene FLASK_SECRET_KEY por compatibilidad.
    SECRET_KEY = os.getenv("SECRET_KEY") or os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-me")

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = False

    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_PERMANENT = True

    # ====== Google OAuth ======
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

    # ====== OpenRouteService ======
    ORS_API_KEY = os.getenv("ORS_API_KEY", "")

    # ====== Dropbox ======
    DROPBOX_REFRESH_TOKEN = os.getenv("DROPBOX_REFRESH_TOKEN", "")
    DROPBOX_APP_KEY = os.getenv("DROPBOX_APP_KEY", "")
    DROPBOX_APP_SECRET = os.getenv("DROPBOX_APP_SECRET", "")

    # ====== Email SMTP ======
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

    # ====== CORS ======
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# Instancia global de configuración
config = Config()
