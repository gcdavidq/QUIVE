import requests

usuario_id = 5
url = f"http://127.0.0.1:5000/metodos_pago/{usuario_id}"

# Métodos a registrar
metodos = [
    {
        "tipo": "Yape",
        "datos": {
            "codigo": "YAPE0001"
        }
    },
    {
        "tipo": "Yape",
        "datos": {
            "codigo": "YAPE0002"
        }
    },
    {
        "tipo": "PayPal",
        "datos": {
            "correo": "usuario1@example.com",
            "contraseña": "clave123"
        }
    },
    {
        "tipo": "PayPal",
        "datos": {
            "correo": "usuario2@example.com",
            "contraseña": "clave456"
        }
    }
]

# Enviar cada método a la API
for metodo in metodos:
    response = requests.post(url, json=metodo)
    print(f"Registrando {metodo['tipo']}: {response.status_code} -> {response.json()}")
