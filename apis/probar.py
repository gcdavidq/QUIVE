import requests

BASE_URL = "http://localhost:5000"

def registrar_usuario():
    url = f"{BASE_URL}/auth/register"
    payload = {
        "nombre_completo": "Juan Pérez",
        "contrasena": "MiClaveSegura123",
        "dni": "12345678",
        "telefono": "987654321",
        "ubicacion": "Lima, Perú",
        "tipo_usuario": "cliente",
        "email": "cliente@gmail.com"
    }

    response = requests.post(url, json=payload)

    if response.status_code == 201:
        print("✅ Usuario creado:", response.json())
    else:
        print("❌ Error:", response.status_code, response.text)

def login_user():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "cliente@gmail.com",  # O puedes usar solo dni si prefieres
        "dni": "12345678",
        "contrasena": "MiClaveSegura123"
    }
    response = requests.post(url, json=payload)

    print("LOGIN:", response.status_code)

    try:
        data = response.json()
        print("LOGIN RESPONSE:", data)
        return response
    except requests.exceptions.JSONDecodeError:
        print("Error: La respuesta no es JSON válido")
        print("Texto bruto de la respuesta:", response.text)
        return response
token = login_user().json()['access_token']

def logout_user(access_token):
    url = f"{BASE_URL}/auth/logout"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(url, headers=headers)
    print("LOGOUT:", response.status_code, response.json())
    return response

registrar_usuario()
