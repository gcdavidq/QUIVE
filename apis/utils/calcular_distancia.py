import openrouteservice
from openrouteservice import convert

def extraer_coordenadas(texto):
    try:
        coord_texto = texto.split(";")[-1].strip()
        lat, lon = map(float, coord_texto.split(","))
        return (lon, lat)  # Nota: ORS espera (lon, lat)
    except Exception as e:
        raise ValueError(f"No se pudieron extraer coordenadas de: {texto}") from e

def calcular_ruta_ors(origen_txt, destino_txt, ubicacion_transportista_txt):
    # Extraer coordenadas
    origen_coords = extraer_coordenadas(origen_txt)
    destino_coords = extraer_coordenadas(destino_txt)
    trans_coords = extraer_coordenadas(ubicacion_transportista_txt)

    # Cliente ORS
    client = openrouteservice.Client(key="5b3ce3597851110001cf6248586c45473a8042fbbe48c152e2539778")

    resultados = {}
    try:
        # Ruta transportista → origen
        ruta1 = client.directions(
            coordinates=[trans_coords, origen_coords],
            profile='driving-car',
            format='json'
        )
        resultados["distancia_trans_origen_km"] = ruta1['routes'][0]['summary']['distance'] / 1000
        resultados["ruta_origen"] = convert.decode_polyline(ruta1['routes'][0]['geometry'])['coordinates']
        resultados["ruta_origen"] = [[lat, lon] for lon, lat in resultados["ruta_origen"]]
        # Ruta origen → destino
        ruta2 = client.directions(
            coordinates=[trans_coords, destino_coords],
            profile='driving-car',
            format='json'
        )
        resultados["distancia_trans_destino_km"] = ruta2['routes'][0]['summary']['distance']
        resultados["ruta_destino"] = convert.decode_polyline(ruta2['routes'][0]['geometry'])['coordinates']
        resultados["ruta_destino"]=[[lat, lon] for lon, lat in resultados["ruta_destino"]]
    except openrouteservice.exceptions.ApiError as e:
        raise RuntimeError("Error al consultar OpenRouteService") from e

    return resultados