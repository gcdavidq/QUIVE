import pymysql
from flask import g
from config import config

def get_db_connection():
    """
    Devuelve una nueva conexión a la base de datos.
    Siempre cierra cursor al finalizar cada operación.
    """
    conn = pymysql.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        port=config.DB_PORT,
        database=config.DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True  # Evita tener que hacer conn.commit() manualmente
    )
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
