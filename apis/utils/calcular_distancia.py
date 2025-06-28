import openrouteservice

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
        # Ruta desde transportista al origen
        ruta1 = client.directions(
            coordinates=[trans_coords, origen_coords],
            profile='driving-car',
            format='json'
        )
        resultados["distancia_trans_origen_km"] = ruta1['routes'][0]['summary']['distance'] / 1000

        # Ruta desde origen al destino
        ruta2 = client.directions(
            coordinates=[trans_coords, destino_coords],
            profile='driving-car',
            format='json'
        )
        resultados["distancia_trans_destino_km"] = ruta2['routes'][0]['summary']['distance'] / 1000

    except openrouteservice.exceptions.ApiError as e:
        raise RuntimeError("Error al consultar OpenRouteService") from e

    return resultados