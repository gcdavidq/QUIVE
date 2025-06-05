from flask import Flask, request, jsonify
import requests

app = Flask(__name__)
BASE_URL = "http://localhost:5000"

def proxy_request(method, path):
    url = f"{BASE_URL}{path}"
    headers = {key: value for key, value in request.headers if key != 'Host'}
    data = request.get_json(silent=True)
    params = request.args

    try:
        resp = requests.request(method, url, headers=headers, json=data, params=params)
        print("RAW RESPONSE TEXT:", resp.text)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e), "raw": resp.text}), 500


@app.route('/api_proxy/delete/id_solicitud_objetos_id_objeto', methods=['DELETE'])
def proxy_delete_id_solicitud_objetos_id_objeto():
    return proxy_request("DELETE", "/<int:id_solicitud>/objetos/<int:id_objeto>")

@app.route('/api_proxy/delete/me', methods=['DELETE'])
def proxy_delete_me():
    return proxy_request("DELETE", "/me")

@app.route('/api_proxy/delete/me_id_vehiculo', methods=['DELETE'])
def proxy_delete_me_id_vehiculo():
    return proxy_request("DELETE", "/me/<int:id_vehiculo>")

@app.route('/api_proxy/delete/metodos-pago_me_id_metodo', methods=['DELETE'])
def proxy_delete_metodos_pago_me_id_metodo():
    return proxy_request("DELETE", "/metodos-pago/me/<int:id_metodo>")

@app.route('/api_proxy/delete/tipos-objeto_id_tipo', methods=['DELETE'])
def proxy_delete_tipos_objeto_id_tipo():
    return proxy_request("DELETE", "/tipos-objeto/<int:id_tipo>")

@app.route('/api_proxy/delete/tipos-vehiculo_id_tipo_vehiculo', methods=['DELETE'])
def proxy_delete_tipos_vehiculo_id_tipo_vehiculo():
    return proxy_request("DELETE", "/tipos-vehiculo/<int:id_tipo_vehiculo>")

@app.route('/api_proxy/get/root', methods=['GET'])
def proxy_get_root():
    return proxy_request("GET", "")

@app.route('/api_proxy/get/id_asignacion_estado', methods=['GET'])
def proxy_get_id_asignacion_estado():
    return proxy_request("GET", "/<int:id_asignacion>/estado")

@app.route('/api_proxy/get/id_asignacion_incidentes', methods=['GET'])
def proxy_get_id_asignacion_incidentes():
    return proxy_request("GET", "/<int:id_asignacion>/incidentes")

@app.route('/api_proxy/get/id_asignacion_ruta', methods=['GET'])
def proxy_get_id_asignacion_ruta():
    return proxy_request("GET", "/<int:id_asignacion>/ruta")

@app.route('/api_proxy/get/id_asignacion_ultimo', methods=['GET'])
def proxy_get_id_asignacion_ultimo():
    return proxy_request("GET", "/<int:id_asignacion>/ultimo")

@app.route('/api_proxy/get/id_incidente', methods=['GET'])
def proxy_get_id_incidente():
    return proxy_request("GET", "/<int:id_incidente>")

@app.route('/api_proxy/get/id_solicitud', methods=['GET'])
def proxy_get_id_solicitud():
    return proxy_request("GET", "/<int:id_solicitud>")

@app.route('/api_proxy/get/id_solicitud_objetos', methods=['GET'])
def proxy_get_id_solicitud_objetos():
    return proxy_request("GET", "/<int:id_solicitud>/objetos")

@app.route('/api_proxy/get/id_solicitud_tarifa', methods=['GET'])
def proxy_get_id_solicitud_tarifa():
    return proxy_request("GET", "/<int:id_solicitud>/tarifa")

@app.route('/api_proxy/get/id_usuario', methods=['GET'])
def proxy_get_id_usuario():
    return proxy_request("GET", "/<int:id_usuario>")

@app.route('/api_proxy/get/id_usuario_documentos', methods=['GET'])
def proxy_get_id_usuario_documentos():
    return proxy_request("GET", "/<int:id_usuario>/documentos")

@app.route('/api_proxy/get/disponibles', methods=['GET'])
def proxy_get_disponibles():
    return proxy_request("GET", "/disponibles")

@app.route('/api_proxy/get/me', methods=['GET'])
def proxy_get_me():
    return proxy_request("GET", "/me")

@app.route('/api_proxy/get/me_documentos', methods=['GET'])
def proxy_get_me_documentos():
    return proxy_request("GET", "/me/documentos")

@app.route('/api_proxy/get/metodos-pago_me', methods=['GET'])
def proxy_get_metodos_pago_me():
    return proxy_request("GET", "/metodos-pago/me")

@app.route('/api_proxy/get/tipos-objeto', methods=['GET'])
def proxy_get_tipos_objeto():
    return proxy_request("GET", "/tipos-objeto")

@app.route('/api_proxy/get/tipos-vehiculo', methods=['GET'])
def proxy_get_tipos_vehiculo():
    return proxy_request("GET", "/tipos-vehiculo")

@app.route('/api_proxy/post/root', methods=['POST'])
def proxy_post_root():
    return proxy_request("POST", "")

@app.route('/api_proxy/post/id_solicitud_objetos', methods=['POST'])
def proxy_post_id_solicitud_objetos():
    return proxy_request("POST", "/<int:id_solicitud>/objetos")

@app.route('/api_proxy/post/enviar', methods=['POST'])
def proxy_post_enviar():
    return proxy_request("POST", "/enviar")

@app.route('/api_proxy/post/login', methods=['POST'])
def proxy_post_login():
    return proxy_request("POST", "/login")

@app.route('/api_proxy/post/logout', methods=['POST'])
def proxy_post_logout():
    return proxy_request("POST", "/logout")

@app.route('/api_proxy/post/me', methods=['POST'])
def proxy_post_me():
    return proxy_request("POST", "/me")

@app.route('/api_proxy/post/me_documentos', methods=['POST'])
def proxy_post_me_documentos():
    return proxy_request("POST", "/me/documentos")

@app.route('/api_proxy/post/metodos-pago_me', methods=['POST'])
def proxy_post_metodos_pago_me():
    return proxy_request("POST", "/metodos-pago/me")

@app.route('/api_proxy/post/register', methods=['POST'])
def proxy_post_register():
    return proxy_request("POST", "/auth/register")

@app.route('/api_proxy/post/subscribe', methods=['POST'])
def proxy_post_subscribe():
    return proxy_request("POST", "/subscribe")

@app.route('/api_proxy/post/tipos-objeto', methods=['POST'])
def proxy_post_tipos_objeto():
    return proxy_request("POST", "/tipos-objeto")

@app.route('/api_proxy/post/tipos-vehiculo', methods=['POST'])
def proxy_post_tipos_vehiculo():
    return proxy_request("POST", "/tipos-vehiculo")

@app.route('/api_proxy/post/unsubscribe', methods=['POST'])
def proxy_post_unsubscribe():
    return proxy_request("POST", "/unsubscribe")

@app.route('/api_proxy/post/webhook', methods=['POST'])
def proxy_post_webhook():
    return proxy_request("POST", "/webhook")

@app.route('/api_proxy/put/id_asignacion_cancelar', methods=['PUT'])
def proxy_put_id_asignacion_cancelar():
    return proxy_request("PUT", "/<int:id_asignacion>/cancelar")

@app.route('/api_proxy/put/id_asignacion_completar', methods=['PUT'])
def proxy_put_id_asignacion_completar():
    return proxy_request("PUT", "/<int:id_asignacion>/completar")

@app.route('/api_proxy/put/id_asignacion_confirmar', methods=['PUT'])
def proxy_put_id_asignacion_confirmar():
    return proxy_request("PUT", "/<int:id_asignacion>/confirmar")

@app.route('/api_proxy/put/id_asignacion_rechazar', methods=['PUT'])
def proxy_put_id_asignacion_rechazar():
    return proxy_request("PUT", "/<int:id_asignacion>/rechazar")

@app.route('/api_proxy/put/id_incidente_estado', methods=['PUT'])
def proxy_put_id_incidente_estado():
    return proxy_request("PUT", "/<int:id_incidente>/estado")

@app.route('/api_proxy/put/id_pago_reembolsar', methods=['PUT'])
def proxy_put_id_pago_reembolsar():
    return proxy_request("PUT", "/<int:id_pago>/reembolsar")

@app.route('/api_proxy/put/id_solicitud', methods=['PUT'])
def proxy_put_id_solicitud():
    return proxy_request("PUT", "/<int:id_solicitud>")

@app.route('/api_proxy/put/id_solicitud_objetos_id_objeto', methods=['PUT'])
def proxy_put_id_solicitud_objetos_id_objeto():
    return proxy_request("PUT", "/<int:id_solicitud>/objetos/<int:id_objeto>")

@app.route('/api_proxy/put/id_usuario_status', methods=['PUT'])
def proxy_put_id_usuario_status():
    return proxy_request("PUT", "/<int:id_usuario>/status")

@app.route('/api_proxy/put/id_usuario_verificacion', methods=['PUT'])
def proxy_put_id_usuario_verificacion():
    return proxy_request("PUT", "/<int:id_usuario>/verificacion")

@app.route('/api_proxy/put/me', methods=['PUT'])
def proxy_put_me():
    return proxy_request("PUT", "/me")

@app.route('/api_proxy/put/me_id_vehiculo', methods=['PUT'])
def proxy_put_me_id_vehiculo():
    return proxy_request("PUT", "/me/<int:id_vehiculo>")

@app.route('/api_proxy/put/me_change-password', methods=['PUT'])
def proxy_put_me_change_password():
    return proxy_request("PUT", "/me/change-password")

@app.route('/api_proxy/put/metodos-pago_me_id_metodo', methods=['PUT'])
def proxy_put_metodos_pago_me_id_metodo():
    return proxy_request("PUT", "/metodos-pago/me/<int:id_metodo>")

@app.route('/api_proxy/put/tipos-objeto_id_tipo', methods=['PUT'])
def proxy_put_tipos_objeto_id_tipo():
    return proxy_request("PUT", "/tipos-objeto/<int:id_tipo>")

@app.route('/api_proxy/put/tipos-vehiculo_id_tipo_vehiculo', methods=['PUT'])
def proxy_put_tipos_vehiculo_id_tipo_vehiculo():
    return proxy_request("PUT", "/tipos-vehiculo/<int:id_tipo_vehiculo>")


if __name__ == '__main__':
    app.run(port=5001, debug=True)
