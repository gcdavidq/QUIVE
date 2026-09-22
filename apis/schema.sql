-- ============================================================
-- QUIVE — Schema PostgreSQL
-- Plataforma de logística de mudanzas
-- ============================================================

-- ====== Usuarios ======
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario      SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    email           VARCHAR(200) UNIQUE NOT NULL,
    telefono        VARCHAR(30) DEFAULT '',
    dni             VARCHAR(20),
    contrasena_hash TEXT,
    ubicacion       TEXT DEFAULT '',
    tipo_usuario    VARCHAR(20) NOT NULL DEFAULT 'cliente'
                        CHECK (tipo_usuario IN ('cliente', 'transportista', 'admin')),
    fecha_registro  TIMESTAMP DEFAULT NOW(),
    estado_cuenta   VARCHAR(20) DEFAULT 'activo'
                        CHECK (estado_cuenta IN ('activo', 'inactivo', 'suspendido')),
    foto_perfil_url TEXT DEFAULT '',
    google_id       VARCHAR(100),
    -- Cuenta de demostración: se muestra como tal en la UI y no se mezcla con usuarios reales.
    es_demo         BOOLEAN NOT NULL DEFAULT FALSE
);

-- ====== Tipos de Vehículo (catálogo) ======
CREATE TABLE IF NOT EXISTS Tipos_Vehiculo (
    id_tipo_vehiculo SERIAL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    capacidad_volumen NUMERIC(10,2) DEFAULT 0,
    capacidad_peso    NUMERIC(10,2) DEFAULT 0,
    descripcion       TEXT,
    largo             NUMERIC(10,2),
    ancho             NUMERIC(10,2),
    alto              NUMERIC(10,2)
);

-- ====== Vehículos ======
CREATE TABLE IF NOT EXISTS Vehiculos (
    id_vehiculo      SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_tipo_vehiculo INTEGER NOT NULL REFERENCES Tipos_Vehiculo(id_tipo_vehiculo),
    placa            VARCHAR(20) NOT NULL,
    estado           VARCHAR(20) DEFAULT 'activo'
                        CHECK (estado IN ('activo', 'inactivo'))
);

-- ====== Documentos de Transportista ======
CREATE TABLE IF NOT EXISTS Documentos_Transportista (
    id_documento          SERIAL PRIMARY KEY,
    id_usuario            INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    licencia_conducir_url TEXT,
    tarjeta_propiedad_url TEXT,
    certificado_itv_url   TEXT,
    estado_verificacion   VARCHAR(30) DEFAULT 'pendiente'
                            CHECK (estado_verificacion IN ('pendiente', 'verificado', 'rechazado'))
);

-- ====== Tarifas de Transportista ======
CREATE TABLE IF NOT EXISTS Tarifas_Transportista (
    id_tarifa         SERIAL PRIMARY KEY,
    id_transportista  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    precio_por_m3     NUMERIC(10,2) DEFAULT 0,
    precio_por_kg     NUMERIC(10,2) DEFAULT 0,
    precio_por_km     NUMERIC(10,2) DEFAULT 0,
    recargo_fragil    NUMERIC(10,2) DEFAULT 0,
    recargo_embalaje  NUMERIC(10,2) DEFAULT 0
);

-- ====== Tipos de Objeto (catálogo) ======
CREATE TABLE IF NOT EXISTS Tipos_Objeto (
    id_tipo           SERIAL PRIMARY KEY,
    categoria         VARCHAR(100) NOT NULL,
    variante          VARCHAR(100),
    descripcion       TEXT,
    volumen_estimado  NUMERIC(10,4) DEFAULT 0,
    peso_estimado     NUMERIC(10,2) DEFAULT 0,
    es_fragil         BOOLEAN DEFAULT FALSE,
    necesita_embalaje BOOLEAN DEFAULT FALSE,
    imagen_url        TEXT
);

-- ====== Solicitudes de Mudanza ======
CREATE TABLE IF NOT EXISTS Solicitudes (
    id_solicitud    SERIAL PRIMARY KEY,
    id_cliente      INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    origen          TEXT NOT NULL,
    destino         TEXT NOT NULL,
    ruta            TEXT,
    distancia       NUMERIC(12,4),
    tiempo_estimado VARCHAR(50),
    fecha_hora      TIMESTAMP NOT NULL,
    estado          VARCHAR(30) DEFAULT 'en espera'
                        CHECK (estado IN ('en espera', 'confirmada', 'activa', 'finalizada', 'cancelada'))
);

-- ====== Objetos dentro de una Solicitud ======
CREATE TABLE IF NOT EXISTS Objetos_Solicitud (
    id_objeto     SERIAL PRIMARY KEY,
    id_solicitud  INTEGER NOT NULL REFERENCES Solicitudes(id_solicitud) ON DELETE CASCADE,
    id_tipo       INTEGER NOT NULL REFERENCES Tipos_Objeto(id_tipo),
    cantidad      INTEGER DEFAULT 1,
    observaciones TEXT,
    imagen_url    TEXT
);

-- ====== Distancias precalculadas solicitud ↔ transportistas ======
CREATE TABLE IF NOT EXISTS DistanciasSolicitud (
    id                SERIAL PRIMARY KEY,
    id_solicitud      INTEGER NOT NULL REFERENCES Solicitudes(id_solicitud) ON DELETE CASCADE,
    id_transportista  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    distancia_origen  NUMERIC(12,4),
    distancia_destino NUMERIC(12,4),
    ruta_origen       TEXT,
    ruta_destino      TEXT
);

-- ====== Asignaciones ======
CREATE TABLE IF NOT EXISTS Asignaciones (
    id_asignacion      SERIAL PRIMARY KEY,
    id_solicitud       INTEGER NOT NULL REFERENCES Solicitudes(id_solicitud) ON DELETE CASCADE,
    id_transportista   INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_confirmacion TIMESTAMP,
    estado             VARCHAR(30) DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'confirmada', 'rechazada', 'cancelada', 'activo', 'completado')),
    precio             NUMERIC(12,2)
);

-- ====== Seguimiento en tiempo real ======
CREATE TABLE IF NOT EXISTS Seguimiento (
    id_seguimiento            SERIAL PRIMARY KEY,
    id_asignacion             INTEGER NOT NULL REFERENCES Asignaciones(id_asignacion) ON DELETE CASCADE,
    latitud                   NUMERIC(12,8),
    longitud                  NUMERIC(12,8),
    hora_ultima_actualizacion TIMESTAMP DEFAULT NOW()
);

-- ====== Métodos de Pago de Usuario ======
CREATE TABLE IF NOT EXISTS Metodos_Pago_Usuario (
    id               SERIAL PRIMARY KEY,
    usuario_id       INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    tipo_metodo      VARCHAR(30) NOT NULL,
    id_metodo_externo INTEGER
);

-- ====== Pagos ======
CREATE TABLE IF NOT EXISTS Pagos (
    id_pago              SERIAL PRIMARY KEY,
    id_asignacion        INTEGER NOT NULL REFERENCES Asignaciones(id_asignacion) ON DELETE CASCADE,
    monto_total          NUMERIC(12,2),
    pagador_id           INTEGER REFERENCES Metodos_Pago_Usuario(id),
    receptor_id          INTEGER REFERENCES Metodos_Pago_Usuario(id),
    tipo_metodo_pagador  VARCHAR(30),
    tipo_metodo_receptor VARCHAR(30),
    estado_pago          VARCHAR(30) DEFAULT 'pendiente'
                            CHECK (estado_pago IN ('pendiente', 'completado', 'fallido', 'reembolsado'))
);

-- ====== Calificaciones ======
CREATE TABLE IF NOT EXISTS Calificaciones (
    id_calificacion SERIAL PRIMARY KEY,
    id_asignacion   INTEGER NOT NULL REFERENCES Asignaciones(id_asignacion) ON DELETE CASCADE,
    calificador     INTEGER NOT NULL REFERENCES Usuarios(id_usuario),
    calificado      INTEGER NOT NULL REFERENCES Usuarios(id_usuario),
    puntaje         INTEGER CHECK (puntaje >= 1 AND puntaje <= 5),
    comentario      TEXT
);

-- ====== Incidentes ======
CREATE TABLE IF NOT EXISTS Incidentes (
    id_incidente  SERIAL PRIMARY KEY,
    id_asignacion INTEGER NOT NULL REFERENCES Asignaciones(id_asignacion) ON DELETE CASCADE,
    descripcion   TEXT NOT NULL,
    foto_url      TEXT,
    fecha_reporte TIMESTAMP DEFAULT NOW()
);

-- ====== Notificaciones ======
CREATE TABLE IF NOT EXISTS Notificaciones (
    id_notificacion  SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    tipo_evento      VARCHAR(60),
    tabla_referencia VARCHAR(60),
    id_referencia    INTEGER,
    mensaje          TEXT,
    leido            BOOLEAN DEFAULT FALSE,
    fecha            TIMESTAMP DEFAULT NOW()
);

-- ====== Pasarela de Pagos (simulada) ======

CREATE TABLE IF NOT EXISTS Tarjeta (
    id          SERIAL PRIMARY KEY,
    numero      VARCHAR(20),
    cvv         VARCHAR(4),
    vencimiento VARCHAR(10),
    titular     VARCHAR(200),
    saldo       NUMERIC(12,2) DEFAULT 0,
    activo      BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Yape (
    id      SERIAL PRIMARY KEY,
    codigo  VARCHAR(30),
    titular VARCHAR(200),
    saldo   NUMERIC(12,2) DEFAULT 0,
    activo  BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS PayPal (
    id         SERIAL PRIMARY KEY,
    correo     VARCHAR(200),
    contrasena VARCHAR(200),
    titular    VARCHAR(200),
    saldo      NUMERIC(12,2) DEFAULT 0,
    activo     BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- FUNCIONES (reemplazan stored procedures de MySQL)
-- ============================================================

-- Función: ObtenerSolicitudesConDetalle
-- Devuelve la solicitud de un usuario con detalles completos
CREATE OR REPLACE FUNCTION ObtenerSolicitudesConDetalle(
    p_user_id INTEGER,
    p_estado VARCHAR,
    p_extra VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id_solicitud        INTEGER,
    origen              TEXT,
    destino             TEXT,
    ruta                TEXT,
    distancia           NUMERIC,
    tiempo_estimado     VARCHAR,
    fecha_hora          TIMESTAMP,
    estado              VARCHAR,
    -- transportista info
    id_transportista    INTEGER,
    nombre              VARCHAR,
    foto                TEXT,
    -- asignacion info
    id_asignacion       INTEGER,
    estado_asignacion   VARCHAR,
    precio              NUMERIC,
    -- tiempos calculados
    tiempo_total_estimado_horas NUMERIC,
    tiempo_solo_ruta    NUMERIC,
    ruta_transportista_origen TEXT,
    -- objetos como JSON
    objetos             TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id_solicitud,
        s.origen,
        s.destino,
        s.ruta,
        s.distancia,
        s.tiempo_estimado,
        s.fecha_hora,
        s.estado,

        u_trans.id_usuario AS id_transportista,
        u_trans.nombre_completo::VARCHAR AS nombre,
        u_trans.foto_perfil_url AS foto,

        a.id_asignacion,
        a.estado::VARCHAR AS estado_asignacion,
        a.precio,

        -- tiempo total estimado (distancia transportista-origen + ruta mudanza en horas aprox)
        COALESCE(
            (ds.distancia_origen / 50.0) + (s.distancia / 50.0),
            s.distancia / 50.0
        )::NUMERIC AS tiempo_total_estimado_horas,

        COALESCE(s.distancia / 50.0, 0)::NUMERIC AS tiempo_solo_ruta,

        ds.ruta_origen AS ruta_transportista_origen,

        -- objetos como JSON array
        COALESCE(
            (SELECT json_agg(json_build_object(
                'id_objeto', os.id_objeto,
                'id_tipo', os.id_tipo,
                'categoria', t.categoria,
                'variante', t.variante,
                'cantidad', os.cantidad,
                'imagen_url', os.imagen_url
            ))::TEXT
            FROM Objetos_Solicitud os
            JOIN Tipos_Objeto t ON os.id_tipo = t.id_tipo
            WHERE os.id_solicitud = s.id_solicitud),
            '[]'
        ) AS objetos

    FROM Solicitudes s
    LEFT JOIN Asignaciones a ON s.id_solicitud = a.id_solicitud
    LEFT JOIN Usuarios u_trans ON a.id_transportista = u_trans.id_usuario
    LEFT JOIN DistanciasSolicitud ds ON ds.id_solicitud = s.id_solicitud
                                    AND ds.id_transportista = a.id_transportista
    WHERE s.id_cliente = p_user_id
      AND s.estado = p_estado
    ORDER BY s.fecha_hora DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- Función: ObtenerTransportistasRecomendados
-- Devuelve transportistas candidatos para una solicitud, con métricas
CREATE OR REPLACE FUNCTION ObtenerTransportistasRecomendados(
    p_id_solicitud INTEGER
)
RETURNS TABLE (
    id_transportista         INTEGER,
    nombre                   VARCHAR,
    foto_perfil_url          TEXT,
    vehiculo                 VARCHAR,
    capacidad                VARCHAR,
    viajes                   BIGINT,
    promedio_calificaciones   NUMERIC,
    cantidad_incidentes      BIGINT,
    precio_estimado_total    NUMERIC,
    distancia_al_origen      NUMERIC,
    ruta_origen              TEXT,
    ruta_destino             TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id_usuario AS id_transportista,
        u.nombre_completo::VARCHAR AS nombre,
        u.foto_perfil_url,

        tv.nombre::VARCHAR AS vehiculo,
        CONCAT(tv.capacidad_volumen::TEXT, ' m³ / ', tv.capacidad_peso::TEXT, ' kg')::VARCHAR AS capacidad,

        -- cantidad de viajes completados
        COALESCE((
            SELECT COUNT(*)
            FROM Asignaciones a2
            WHERE a2.id_transportista = u.id_usuario AND a2.estado = 'completado'
        ), 0)::BIGINT AS viajes,

        -- promedio de calificaciones
        COALESCE((
            SELECT AVG(c.puntaje)::NUMERIC
            FROM Calificaciones c
            WHERE c.calificado = u.id_usuario
        ), 3.0)::NUMERIC AS promedio_calificaciones,

        -- cantidad de incidentes
        COALESCE((
            SELECT COUNT(*)
            FROM Incidentes i
            JOIN Asignaciones a3 ON i.id_asignacion = a3.id_asignacion
            WHERE a3.id_transportista = u.id_usuario
        ), 0)::BIGINT AS cantidad_incidentes,

        -- precio estimado basado en tarifas y distancia de la solicitud
        COALESCE((
            SELECT (tt.precio_por_km * s.distancia / 1000.0)
            FROM Tarifas_Transportista tt, Solicitudes s
            WHERE tt.id_transportista = u.id_usuario
              AND s.id_solicitud = p_id_solicitud
        ), 50.0)::NUMERIC AS precio_estimado_total,

        ds.distancia_origen AS distancia_al_origen,
        ds.ruta_origen,
        ds.ruta_destino

    FROM Usuarios u
    JOIN DistanciasSolicitud ds ON ds.id_transportista = u.id_usuario
                                AND ds.id_solicitud = p_id_solicitud
    LEFT JOIN Vehiculos v ON v.id_usuario = u.id_usuario AND v.estado = 'activo'
    LEFT JOIN Tipos_Vehiculo tv ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
    WHERE u.tipo_usuario = 'transportista'
      AND u.estado_cuenta = 'activo'
    ORDER BY ds.distancia_origen ASC;
END;
$$ LANGUAGE plpgsql;
