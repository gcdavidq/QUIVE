import math
import requests
from typing import Any, Dict

def get_road_accessible_coordinates(
    direccion: str,
) -> Dict[str, float]:
    """
    1) Geocodifica una dirección completa (string) usando Nominatim (OSM).
    2) Verifica, mediante OSRM, que el punto obtenido esté sobre una carretera (servicio 'nearest').
       Si OSRM devuelve éxito, considera que el lugar es accesible por carretera.

    Parámetro:
        direccion: str
            Dirección en formato:
            "<TipoVia> <NombreVia> <Número>, <Distrito>, <Provincia>, <Departamento>, Peru"
            (Ejemplo: "Calle Primavera 123, Huancavelica, Huancavelica, Huancavelica, Peru")

    Retorna:
        {"lat": float, "lon": float} si existe geocodificación y OSRM nearest confirma que está sobre la red vial.

    Lanza excepción si:
      - Nominatim no encuentra ningún resultado.
      - OSRM nearest no devuelve una carretera cercana.
      - Cualquier error HTTP en las peticiones.
    """

    # === Paso 1: Geocodificar con Nominatim ===
    nominatim_url = "https://nominatim.openstreetmap.org/search"
    params_nom = {
        "q": direccion,
        "format": "json",
        "limit": 1,              # Solo nos interesa el primer (más relevante) resultado
        "addressdetails": 0,     # No necesitamos detalles adicionales
    }
    headers_nom = {
        # Es obligatorio incluir un User-Agent “razonable” para Nominatim
        "User-Agent": "mi-app-geocoding/1.0 (tucorreo@ejemplo.com)"
    }

    resp_nom = requests.get(nominatim_url, params=params_nom, headers=headers_nom)
    try:
        resp_nom.raise_for_status()
    except requests.exceptions.HTTPError as err:
        raise Exception(f"Error al geocodificar con Nominatim: {resp_nom.text}") from err

    resultados = resp_nom.json()
    if not isinstance(resultados, list) or len(resultados) == 0:
        raise Exception(f"Nominatim no encontró resultados para: '{direccion}'")

    # Extraemos latitud y longitud del primer resultado
    primer = resultados[0]
    lat_str = primer.get("lat")
    lon_str = primer.get("lon")
    if lat_str is None or lon_str is None:
        raise Exception(f"Nominatim devolvió un resultado sin lat/lon: {primer!r}")

    try:
        lat = float(lat_str)
        lon = float(lon_str)
    except ValueError:
        raise Exception(f"Lat/Lon no son numéricos: lat='{lat_str}', lon='{lon_str}'")

    # === Paso 2: Verificar accesibilidad por carretera con OSRM nearest ===
    # Usamos el endpoint "nearest" de OSRM para ver si existe una carretera cercana.
    # Si no hay ninguna carretera a la que proyectar este punto, OSRM devol verá código 200
    # pero sin 'waypoints' útiles, o código 400/404. Lo manejamos con .raise_for_status() y comprobación.
    osrm_nearest_url = (
        f"http://router.project-osrm.org/nearest/v1/driving/{lon},{lat}"
        f"?number=1"
    )
    resp_osrm = requests.get(osrm_nearest_url)
    try:
        resp_osrm.raise_for_status()
    except requests.exceptions.HTTPError as err:
        raise Exception(f"Error al consultar OSRM nearest: {resp_osrm.text}") from err

    data_nearest = resp_osrm.json()
    # OSRM nearest devuelve un array "waypoints". Si este array está vacío, no hay vía cercana.
    waypoints = data_nearest.get("waypoints", [])
    if not isinstance(waypoints, list) or len(waypoints) == 0:
        raise Exception(
            f"OSRM nearest no encontró una carretera cercana a lat={lat}, lon={lon}"
        )

    # En modo normal, waypoints[0]["location"] contendrá [lon_ruteado, lat_ruteado].
    # Si queremos las coordenadas exactas del nodor de la carretera usamos eso; pero
    # generalmente basta con las coordenadas de geocodificación inicial para devolverlas.
    # Si prefieres devolver la ubicación exacta del nodo en la carretera, podrías hacer:
    #    lon_on_road, lat_on_road = waypoints[0]["location"]
    #    return {"lat": lat_on_road, "lon": lon_on_road}
    #
    # Pero en este ejemplo devolvemos la lat/lon originales porque ya validamos que
    # estén en la red vial.
    return {"lat": lat, "lon": lon}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia (en kilómetros) entre dos puntos GPS usando la fórmula de Haversine.
    """
    R = 6371  # Radio de la Tierra en km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_route_osrm(lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, Any]:
    """
    Solicita a OSRM la ruta entre dos puntos.
    URL del endpoint público de OSRM.

    Devuelve el JSON completo de la respuesta, que incluye:
      - routes[0].distance  (en metros)
      - routes[0].duration  (en segundos)
      - routes[0].geometry  (GeoJSON LineString)

    Si hay error HTTP, levanta excepción.
    """
    # Montamos la URL con parámetros:
    #  - overview=full para que devuelva la geometría completa
    #  - geometries=geojson para que la ruta venga en formato GeoJSON nativo
    url = (
        f"http://router.project-osrm.org/route/v1/driving/"
        f"{lon1},{lat1};{lon2},{lat2}"
        f"?overview=full&geometries=geojson"
    )
    response = requests.get(url)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_err:
        raise Exception(f"Error en la petición a OSRM: {response.text}")

    data = response.json()
    # Verificamos que exista al menos una ruta:
    if "routes" not in data or not data["routes"]:
        raise Exception(f"Respuesta inesperada de OSRM: {data}")

    return data


def get_distance_time(lat1: float, lon1: float, lat2: float, lon2: float) -> Dict[str, Any]:
    """
    Obtiene la distancia (en kilómetros) y el tiempo estimado (en minutos) entre dos puntos,
    tanto usando la fórmula de Haversine como la ruta calculada por OSRM.

    Retorna un diccionario con:
      - 'haversine_km': distancia en km (Haversine).
      - 'route_distance_km': distancia de ruta en km (OSRM).
      - 'route_duration_min': duración en minutos (OSRM).
      - 'route_geometry': geometría de la ruta en formato GeoJSON (LineString).
      - 'full_response': JSON completo retornado por OSRM.
    En caso de error, lanza excepción con información.
    """
    # 1) Distancia en línea recta (Haversine)
    distancia_linea = haversine_distance(lat1, lon1, lat2, lon2)

    # 2) Solicitar ruta a OSRM
    data = get_route_osrm(lat1, lon1, lat2, lon2)

    # 3) Extraer distancia (en metros) y duración (en segundos)
    ruta = data["routes"][0]
    distancia_ruta_m = ruta.get("distance")   # en metros
    duracion_ruta_s  = ruta.get("duration")   # en segundos

    if distancia_ruta_m is None or duracion_ruta_s is None:
        raise Exception(f"Datos de distancia/duración faltantes en la respuesta de OSRM: {ruta}")

    # 4) Convertir a unidades deseadas
    distancia_ruta_km  = distancia_ruta_m / 1000.0
    duracion_ruta_min  = duracion_ruta_s / 60.0

    # 5) Extraer geometría (GeoJSON LineString)
    geometry = ruta.get("geometry")
    if geometry is None:
        raise Exception(f"Geometría faltante en la respuesta de OSRM: {ruta}")

    return {
        "haversine_km": round(distancia_linea, 4),
        "route_distance_km": round(distancia_ruta_km, 4),
        "route_duration_min": round(duracion_ruta_min, 4),
        "route_geometry": geometry,
        "full_response": data
    }
