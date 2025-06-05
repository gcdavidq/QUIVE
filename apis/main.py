from flask import Flask
from config import config
from db import close_db
import os
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    app.secret_key = '08f90b23a5d1616bf319bc298105da20'

    # Registrar callback para cerrar la BD al terminar cada request
    app.teardown_appcontext(close_db)

    # IMPORTAR y REGISTRAR TODOS LOS BLUEPRINTS
    from api.auth.routes import auth_bp
    from api.users.routes import users_bp
    from api.transportistas.routes import transportistas_bp
    from api.vehiculos.routes import vehiculos_bp
    from api.objetos.routes import objetos_bp
    from api.solicitudes.routes import solicitudes_bp
    from api.asignaciones.routes import asignaciones_bp
    from api.tracking.routes import tracking_bp
    from api.pagos.routes import pagos_bp
    from api.calificaciones.routes import calificaciones_bp
    from api.incidentes.routes import incidentes_bp
    from api.notificaciones.routes import notificaciones_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(transportistas_bp, url_prefix="/transportistas")
    app.register_blueprint(vehiculos_bp, url_prefix="/vehiculos")
    app.register_blueprint(objetos_bp, url_prefix="/objetos")
    app.register_blueprint(solicitudes_bp, url_prefix="/solicitudes")
    app.register_blueprint(asignaciones_bp, url_prefix="/asignaciones")
    app.register_blueprint(tracking_bp, url_prefix="/tracking")
    app.register_blueprint(pagos_bp, url_prefix="/pagos")
    app.register_blueprint(calificaciones_bp, url_prefix="/calificaciones")
    app.register_blueprint(incidentes_bp, url_prefix="/incidentes")
    app.register_blueprint(notificaciones_bp, url_prefix="/notificaciones")

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
