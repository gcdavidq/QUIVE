import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, Package, Star, Truck, Navigation, AlertCircle, Calendar, User, Scale, Box } from 'lucide-react';

const SeguimientoTab = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  
  // Datos simulados basados en tu JSON
  const deliveryData = {
    capacidad: 0.8,
    destino: "Jirón Carlos Alayzay Roel 2425, Lince, Lima, Lima, Peru",
    destino_coords: [-12.088443920485602, -77.03587532043458],
    distancia: 4856.2,
    estado: "en espera",
    estado_asignacion: "confirmada",
    estado_solicitud: "en espera",
    fecha: "Thu, 06 Nov 2025 00:00:00 GMT",
    fecha_confirmacion: "Fri, 04 Jul 2025 02:38:40 GMT",
    fecha_hora: "Thu, 06 Nov 2025 07:20:00 GMT",
    foto: "https://dl.dropboxusercontent.com/scl/fi/e88auzv0o5t9clqym40s6/yo.jpg?rlkey=pds8j7daejnasrmgfcbu48uc7&dl=0",
    hora: "7:20:00",
    nombre: "Ricardo Escobar",
    monto_total: null,
    objetos: [
      {
        cantidad: 1,
        categoria: "Televisor",
        descripcion: "Televisor de pantalla plana de 32\"",
        embalaje: 1,
        fragil: 1,
        imagen_url: "https://dl.dropboxusercontent.com/scl/fi/qxi2d4y3yws9fqwg8336t/1246102.png?rlkey=k65feo1nr8hz159wc5idyktfu&st=16j5umnd",
        peso: 5.0,
        variante: "32 pulgadas",
        volumen: 0.10000000149011612
      }
    ],
    origen: "Avenida Alfonso Ugarte, Lima, Lima, Lima, Peru",
    origen_coords: [-12.051322144579682, -77.04192592358501],
    precio: 10.13,
    puntaje: "4.8",
    reviews: 23,
    tiempo_solo_ruta: 501.0,
    tiempo_total_estimado_horas: 0.66,
    total_objetos: "1",
    ubicacion: "Pasaje 13, Independencia, Lima, Lima, Peru",
    ubicacion_coords: [-11.975475457951148, -77.04657196998598],
    vehiculo: "Auto pequeño",
    viajes: 5,
    placa: "ABC-123"
  };

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (showMap && !mapLoaded) {
      const loadLeaflet = async () => {
        // Cargar CSS de Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(link);

        // Cargar JavaScript de Leaflet
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.onload = () => {
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      };
      
      loadLeaflet();
    }
  }, [showMap, mapLoaded]);

  // Inicializar mapa cuando Leaflet esté cargado
  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current && !leafletMapRef.current) {
      const L = window.L;
      
      // Crear el mapa
      const map = L.map(mapRef.current, {
        center: [deliveryData.ubicacion_coords[0], deliveryData.ubicacion_coords[1]],
        zoom: 12,
        zoomControl: true
      });

      // Añadir capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Crear iconos personalizados
      const origenIcon = L.divIcon({
        html: `<div style="background: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const destinoIcon = L.divIcon({
        html: `<div style="background: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const ubicacionIcon = L.divIcon({
        html: `<div style="background: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Añadir marcadores
      const origenMarker = L.marker([deliveryData.origen_coords[0], deliveryData.origen_coords[1]], {
        icon: origenIcon
      }).addTo(map);

      const destinoMarker = L.marker([deliveryData.destino_coords[0], deliveryData.destino_coords[1]], {
        icon: destinoIcon
      }).addTo(map);

      const ubicacionMarker = L.marker([deliveryData.ubicacion_coords[0], deliveryData.ubicacion_coords[1]], {
        icon: ubicacionIcon
      }).addTo(map);

      // Añadir popups
      origenMarker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <strong style="color: #10B981;">📍 Origen</strong><br>
          <span style="font-size: 12px; color: #6B7280;">${deliveryData.origen}</span>
        </div>
      `);

      destinoMarker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <strong style="color: #EF4444;">🏁 Destino</strong><br>
          <span style="font-size: 12px; color: #6B7280;">${deliveryData.destino}</span>
        </div>
      `);

      ubicacionMarker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <strong style="color: #3B82F6;">🚛 Ubicación Actual</strong><br>
          <span style="font-size: 12px; color: #6B7280;">${deliveryData.ubicacion}</span><br>
          <span style="font-size: 11px; color: #9CA3AF;">Transportista: ${deliveryData.nombre}</span>
        </div>
      `);

      // Crear ruta simulada (línea entre puntos)
      const routeCoords = [
        [deliveryData.origen_coords[0], deliveryData.origen_coords[1]],
        [deliveryData.ubicacion_coords[0], deliveryData.ubicacion_coords[1]],
        [deliveryData.destino_coords[0], deliveryData.destino_coords[1]]
      ];

      // Ruta completada (origen a ubicación actual)
      const completedRoute = L.polyline([
        [deliveryData.origen_coords[0], deliveryData.origen_coords[1]],
        [deliveryData.ubicacion_coords[0], deliveryData.ubicacion_coords[1]]
      ], {
        color: '#10B981',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map);

      // Ruta restante (ubicación actual a destino)
      const remainingRoute = L.polyline([
        [deliveryData.ubicacion_coords[0], deliveryData.ubicacion_coords[1]],
        [deliveryData.destino_coords[0], deliveryData.destino_coords[1]]
      ], {
        color: '#6B7280',
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 10'
      }).addTo(map);

      // Ajustar vista para mostrar todos los puntos
      const group = new L.featureGroup([origenMarker, destinoMarker, ubicacionMarker, completedRoute, remainingRoute]);
      map.fitBounds(group.getBounds().pad(0.1));

      // Añadir control de escala
      L.control.scale({
        position: 'bottomright',
        metric: true,
        imperial: false
      }).addTo(map);

      // Añadir leyenda
      const legend = L.control({ position: 'topright' });
      legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
          <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; font-size: 12px;">
            <strong style="display: block; margin-bottom: 8px; color: #374151;">Leyenda</strong>
            <div style="margin-bottom: 4px;"><span style="color: #10B981;">●</span> Origen</div>
            <div style="margin-bottom: 4px;"><span style="color: #3B82F6;">●</span> Ubicación Actual</div>
            <div style="margin-bottom: 4px;"><span style="color: #EF4444;">●</span> Destino</div>
            <div style="margin-bottom: 4px;"><span style="color: #10B981;">▬</span> Ruta Completada</div>
            <div><span style="color: #6B7280;">▬</span> Ruta Restante</div>
          </div>
        `;
        return div;
      };
      legend.addTo(map);

      leafletMapRef.current = map;
    }
  }, [mapLoaded, showMap, deliveryData]);

  // Limpiar mapa cuando se oculta
  useEffect(() => {
    if (!showMap && leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
  }, [showMap]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'en espera': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmada': return 'bg-green-100 text-green-800 border-green-300';
      case 'en camino': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'en espera': return <Clock className="w-4 h-4" />;
      case 'confirmada': return <Navigation className="w-4 h-4" />;
      case 'en camino': return <Truck className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const progressPercentage = ((deliveryData.distancia - 1000) / deliveryData.distancia) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Seguimiento de Mudanza</h1>
              <p className="text-gray-600 mt-1">Solicitud #{deliveryData.id_solicitud || '11'}</p>
            </div>
            <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getStatusColor(deliveryData.estado)}`}>
              {getStatusIcon(deliveryData.estado)}
              <span className="font-semibold capitalize">{deliveryData.estado.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progreso del viaje */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Progreso del Viaje</h2>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(deliveryData.tiempo_total_estimado_horas)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Distancia restante</span>
                  <span className="font-semibold">{(deliveryData.distancia / 1000).toFixed(1)} km</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>Origen</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Destino</span>
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de rutas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles de la Ruta</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-800">Origen</p>
                    <p className="text-gray-600 text-sm">{deliveryData.origen}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-800">Ubicación Actual</p>
                    <p className="text-gray-600 text-sm">{deliveryData.ubicacion}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-800">Destino</p>
                    <p className="text-gray-600 text-sm">{deliveryData.destino}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowMap(!showMap)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {showMap ? 'Ocultar Mapa' : 'Ver Ruta en Mapa'}
              </button>
            </div>

            {/* Mapa con Leaflet */}
            {showMap && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Mapa de Ruta en Tiempo Real</h2>
                <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  {!mapLoaded ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Cargando mapa...</p>
                      </div>
                    </div>
                  ) : (
                    <div ref={mapRef} className="w-full h-full"></div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Ruta completada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Ruta restante</span>
                  </div>
                </div>
              </div>
            )}

            {/* Objetos a transportar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Objetos a Transportar</h2>
              <div className="space-y-4">
                {deliveryData.objetos.map((objeto, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{objeto.categoria}</h3>
                      <p className="text-sm text-gray-600">{objeto.descripcion}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {objeto.cantidad} unidad{objeto.cantidad > 1 ? 'es' : ''}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          {objeto.peso} kg
                        </span>
                        {objeto.fragil && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Frágil
                          </span>
                        )}
                        {objeto.embalaje && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                            <Box className="w-3 h-3" />
                            Embalado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha - Información del transportista */}
          <div className="space-y-6">
            {/* Información del transportista */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Transportista</h2>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 capitalize">{deliveryData.nombre}</h3>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{deliveryData.puntaje}</span>
                  <span className="text-sm text-gray-500">({deliveryData.reviews} reseñas)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">{deliveryData.vehiculo}</p>
                    <p className="text-sm text-gray-600">Placa: {deliveryData.placa}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">{deliveryData.viajes} viajes completados</p>
                    <p className="text-sm text-gray-600">Experiencia verificada</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Contactar Transportista
              </button>
            </div>

            {/* Capacidad del vehículo */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Capacidad del Vehículo</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacidad utilizada</span>
                  <span className="font-semibold">{Math.round(deliveryData.capacidad * 100)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${deliveryData.capacidad * 100}%` }}
                  />
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  Espacio disponible para carga adicional
                </p>
              </div>
            </div>

            {/* Detalles de la programación */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Programación</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">Fecha programada</p>
                    <p className="text-sm text-gray-600">
                      {new Date(deliveryData.fecha_hora).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">Hora estimada</p>
                    <p className="text-sm text-gray-600">{deliveryData.hora}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Precio total:</strong> S/ {deliveryData.precio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoTab;