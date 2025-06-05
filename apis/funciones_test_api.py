import requests

BASE_URL = "http://localhost:5000"
HEADERS = {"Authorization": f"Bearer {token}"}  # Asegúrate de definir `token`

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_asignacion_confirmar():
    url = f"{BASE_URL}/api/<int:id_asignacion>/confirmar"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_asignacion>/confirmar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_asignacion_rechazar():
    url = f"{BASE_URL}/api/<int:id_asignacion>/rechazar"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_asignacion>/rechazar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_asignacion_completar():
    url = f"{BASE_URL}/api/<int:id_asignacion>/completar"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_asignacion>/completar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_asignacion_cancelar():
    url = f"{BASE_URL}/api/<int:id_asignacion>/cancelar"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_asignacion>/cancelar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_asignacion_estado():
    url = f"{BASE_URL}/api/<int:id_asignacion>/estado"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_asignacion>/estado:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_register():
    url = f"{BASE_URL}/api/register"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/register:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_login():
    url = f"{BASE_URL}/api/login"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/login:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_logout():
    url = f"{BASE_URL}/api/logout"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/logout:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_usuario_():
    url = f"{BASE_URL}/api/<int:id_usuario>"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_usuario>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_incidente_():
    url = f"{BASE_URL}/api/<int:id_incidente>"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_incidente>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_incidente_estado():
    url = f"{BASE_URL}/api/<int:id_incidente>/estado"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_incidente>/estado:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_asignacion_incidentes():
    url = f"{BASE_URL}/api/<int:id_asignacion>/incidentes"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_asignacion>/incidentes:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_subscribe():
    url = f"{BASE_URL}/api/subscribe"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/subscribe:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_unsubscribe():
    url = f"{BASE_URL}/api/unsubscribe"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/unsubscribe:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_enviar():
    url = f"{BASE_URL}/api/enviar"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/enviar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_tipos_objeto():
    url = f"{BASE_URL}/api/tipos-objeto"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/tipos-objeto:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_tipos_objeto():
    url = f"{BASE_URL}/api/tipos-objeto"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/tipos-objeto:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_tipos_objeto_int_id_tipo_():
    url = f"{BASE_URL}/api/tipos-objeto/<int:id_tipo>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/tipos-objeto/<int:id_tipo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api_tipos_objeto_int_id_tipo_():
    url = f"{BASE_URL}/api/tipos-objeto/<int:id_tipo>"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/tipos-objeto/<int:id_tipo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_solicitud_objetos():
    url = f"{BASE_URL}/api/<int:id_solicitud>/objetos"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_solicitud>/objetos:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api__int_id_solicitud_objetos():
    url = f"{BASE_URL}/api/<int:id_solicitud>/objetos"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/<int:id_solicitud>/objetos:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_solicitud_objetos_int_id_objeto_():
    url = f"{BASE_URL}/api/<int:id_solicitud>/objetos/<int:id_objeto>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_solicitud>/objetos/<int:id_objeto>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api__int_id_solicitud_objetos_int_id_objeto_():
    url = f"{BASE_URL}/api/<int:id_solicitud>/objetos/<int:id_objeto>"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/<int:id_solicitud>/objetos/<int:id_objeto>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_webhook():
    url = f"{BASE_URL}/api/webhook"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/webhook:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_pago_reembolsar():
    url = f"{BASE_URL}/api/<int:id_pago>/reembolsar"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_pago>/reembolsar:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_metodos_pago_me():
    url = f"{BASE_URL}/api/metodos-pago/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/metodos-pago/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_metodos_pago_me():
    url = f"{BASE_URL}/api/metodos-pago/me"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/metodos-pago/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_metodos_pago_me_int_id_metodo_():
    url = f"{BASE_URL}/api/metodos-pago/me/<int:id_metodo>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/metodos-pago/me/<int:id_metodo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api_metodos_pago_me_int_id_metodo_():
    url = f"{BASE_URL}/api/metodos-pago/me/<int:id_metodo>"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/metodos-pago/me/<int:id_metodo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_solicitud_():
    url = f"{BASE_URL}/api/<int:id_solicitud>"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_solicitud>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_solicitud_():
    url = f"{BASE_URL}/api/<int:id_solicitud>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_solicitud>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_disponibles():
    url = f"{BASE_URL}/api/disponibles"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/disponibles:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_solicitud_tarifa():
    url = f"{BASE_URL}/api/<int:id_solicitud>/tarifa"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_solicitud>/tarifa:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_asignacion_ultimo():
    url = f"{BASE_URL}/api/<int:id_asignacion>/ultimo"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_asignacion>/ultimo:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_asignacion_ruta():
    url = f"{BASE_URL}/api/<int:id_asignacion>/ruta"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_asignacion>/ruta:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me_documentos():
    url = f"{BASE_URL}/api/me/documentos"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me/documentos:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_me_documentos():
    url = f"{BASE_URL}/api/me/documentos"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/me/documentos:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_usuario_documentos():
    url = f"{BASE_URL}/api/<int:id_usuario>/documentos"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_usuario>/documentos:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_usuario_verificacion():
    url = f"{BASE_URL}/api/<int:id_usuario>/verificacion"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_usuario>/verificacion:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_me():
    url = f"{BASE_URL}/api/me"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_me_change_password():
    url = f"{BASE_URL}/api/me/change-password"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/me/change-password:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api__int_id_usuario_():
    url = f"{BASE_URL}/api/<int:id_usuario>"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/<int:id_usuario>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api__int_id_usuario_status():
    url = f"{BASE_URL}/api/<int:id_usuario>/status"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/<int:id_usuario>/status:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_me():
    url = f"{BASE_URL}/api/me"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_me():
    url = f"{BASE_URL}/api/me"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/me:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_me_int_id_vehiculo_():
    url = f"{BASE_URL}/api/me/<int:id_vehiculo>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/me/<int:id_vehiculo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api_me_int_id_vehiculo_():
    url = f"{BASE_URL}/api/me/<int:id_vehiculo>"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/me/<int:id_vehiculo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def get_api_tipos_vehiculo():
    url = f"{BASE_URL}/api/tipos-vehiculo"
    response = requests.get(url, headers=HEADERS)
    print("🔹 GET api/tipos-vehiculo:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def post_api_tipos_vehiculo():
    url = f"{BASE_URL}/api/tipos-vehiculo"
    payload = {}  # TODO: definir payload real
    response = requests.post(url, json=payload, headers=HEADERS)
    print("🔹 POST api/tipos-vehiculo:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def put_api_tipos_vehiculo_int_id_tipo_vehiculo_():
    url = f"{BASE_URL}/api/tipos-vehiculo/<int:id_tipo_vehiculo>"
    payload = {}  # TODO: definir payload real si es necesario
    response = requests.put(url, json=payload, headers=HEADERS)
    print("🔹 PUT api/tipos-vehiculo/<int:id_tipo_vehiculo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)

def delete_api_tipos_vehiculo_int_id_tipo_vehiculo_():
    url = f"{BASE_URL}/api/tipos-vehiculo/<int:id_tipo_vehiculo>"
    response = requests.delete(url, headers=HEADERS)
    print("🔹 DELETE api/tipos-vehiculo/<int:id_tipo_vehiculo>:", response.status_code)
    try:
        print(response.json())
    except: print(response.text)
