import psycopg2
import psycopg2.extras
from flask import g
from config import config


def get_db_connection():
    """
    Crea una nueva conexión a PostgreSQL (Neon).
    """
    conn = psycopg2.connect(
        config.DATABASE_URL,
        cursor_factory=psycopg2.extras.RealDictCursor,
    )
    conn.autocommit = True
    return conn


def get_db():
    """
    Si ya existe una conexión en 'g', la reutiliza; de lo contrario, crea una nueva.
    """
    if "db_conn" not in g:
        g.db_conn = get_db_connection()
    return g.db_conn


def close_db(e=None):
    """
    Cierra la conexión y la elimina de 'g'.
    """
    db_conn = g.pop("db_conn", None)
    if db_conn is not None:
        db_conn.close()
