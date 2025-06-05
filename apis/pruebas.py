from utils.geo import get_distance_time, get_road_accessible_coordinates
from utils.generar_html import generar_html_ruta  # asegúrate de importar bien

# Coordenadas de origen y destino
lat1, lon1 = 19.4326, -99.1332  # CDMX centro
lat2, lon2 = 19.4410, -99.1450  # destino cercano

try:
    resultado = get_distance_time(lat1, lon1, lat2, lon2)
    print(f"Distancia Haversine: {resultado['haversine_km']} km")
    print(f"Distancia Ruta: {resultado['route_distance_km']} km")
    print(f"Duración: {resultado['route_duration_min']} min")
    coordenadas = get_road_accessible_coordinates(
        "Jirón Piura 1, Huancavelica, Huancavelica, Huancavelica, Peru"
    )
    print(coordenadas)

    generar_html_ruta(resultado['route_geometry'], output_path='ruta.html')

except Exception as e:
    print("❌ Error al calcular o generar mapa:", e)
