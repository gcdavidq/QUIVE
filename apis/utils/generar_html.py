import json

def generar_html_ruta(geojson_geometry, output_path='ruta.html'):
    geojson_str = json.dumps({
        "type": "Feature",
        "geometry": geojson_geometry,
        "properties": {}
    })

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ruta en Mapa</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        #map {{ height: 100vh; width: 100%; }}
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const geojson = {geojson_str};

        const map = L.map('map').setView([19.437, -99.139], 14);
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
          attribution: '&copy; OpenStreetMap contributors'
        }}).addTo(map);

        L.geoJSON(geojson, {{
          style: {{
            color: 'blue',
            weight: 4
          }}
        }}).addTo(map);

        const bounds = L.geoJSON(geojson).getBounds();
        map.fitBounds(bounds);
      </script>
    </body>
    </html>
    """

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"✅ Mapa generado en: {output_path}")
