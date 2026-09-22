-- ============================================================
-- QUIVE — Datos de prueba (seed)
-- ============================================================

-- ====== Tipos de Vehículo ======
INSERT INTO Tipos_Vehiculo (nombre, capacidad_volumen, capacidad_peso, descripcion, largo, ancho, alto) VALUES
('Camioneta pickup', 2.5, 500, 'Camioneta tipo pickup, ideal para mudanzas pequeñas', 2.0, 1.5, 0.8),
('Furgoneta', 8.0, 1200, 'Furgoneta cerrada de tamaño mediano', 3.0, 1.8, 1.5),
('Camión pequeño', 15.0, 2500, 'Camión de 3.5 toneladas', 4.0, 2.0, 2.0),
('Camión mediano', 25.0, 5000, 'Camión de 7.5 toneladas, ideal para mudanzas grandes', 5.0, 2.3, 2.2),
('Camión grande', 40.0, 10000, 'Camión de 12 toneladas para mudanzas completas', 7.0, 2.5, 2.5);

-- ====== Tipos de Objeto ======
INSERT INTO Tipos_Objeto (categoria, variante, descripcion, volumen_estimado, peso_estimado, es_fragil, necesita_embalaje, imagen_url) VALUES
('Mueble', 'Sofá 3 cuerpos', 'Sofá estándar de tres cuerpos', 1.5, 45, FALSE, FALSE, NULL),
('Mueble', 'Mesa de comedor', 'Mesa rectangular para 6 personas', 0.8, 30, FALSE, FALSE, NULL),
('Mueble', 'Cama Queen', 'Base + colchón queen size', 1.2, 50, FALSE, FALSE, NULL),
('Mueble', 'Ropero grande', 'Armario de 2+ puertas', 2.0, 60, FALSE, FALSE, NULL),
('Mueble', 'Escritorio', 'Escritorio de oficina/estudio', 0.6, 20, FALSE, FALSE, NULL),
('Electrodoméstico', 'Refrigerador', 'Refrigeradora estándar', 0.8, 70, TRUE, TRUE, NULL),
('Electrodoméstico', 'Lavadora', 'Lavadora automática', 0.5, 55, TRUE, TRUE, NULL),
('Electrodoméstico', 'Televisor 55"', 'TV de pantalla plana', 0.15, 15, TRUE, TRUE, NULL),
('Electrodoméstico', 'Microondas', 'Horno microondas', 0.05, 12, TRUE, TRUE, NULL),
('Caja', 'Caja pequeña', 'Caja de cartón 40x30x30cm', 0.036, 10, FALSE, FALSE, NULL),
('Caja', 'Caja mediana', 'Caja de cartón 50x40x40cm', 0.08, 15, FALSE, FALSE, NULL),
('Caja', 'Caja grande', 'Caja de cartón 60x50x50cm', 0.15, 20, FALSE, FALSE, NULL),
('Otro', 'Bicicleta', 'Bicicleta estándar', 0.3, 12, FALSE, FALSE, NULL),
('Otro', 'Colchón individual', 'Colchón de una plaza', 0.3, 15, FALSE, FALSE, NULL);

-- ====== Usuarios de demo ======
-- Password para todos los demo: "password123" → hash bcrypt
-- Hash: $2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK

INSERT INTO Usuarios (nombre_completo, email, telefono, dni, contrasena_hash, ubicacion, tipo_usuario, estado_cuenta, foto_perfil_url) VALUES
('Carlos García López', 'carlos@demo.com', '+51987654321', '12345678',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Av. Javier Prado 1234, San Isidro, Lima, Lima, Peru; -12.0908,-77.0228',
 'cliente', 'activo', ''),
('María Rodriguez Pérez', 'maria@demo.com', '+51912345678', '87654321',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Calle Las Begonias 450, Miraflores, Lima, Lima, Peru; -12.1186,-77.0318',
 'cliente', 'activo', ''),
('Juan Torres Mendoza', 'juan@demo.com', '+51945678123', '11223344',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Av. Brasil 2500, Jesús María, Lima, Lima, Peru; -12.0736,-77.0442',
 'transportista', 'activo', ''),
('Pedro Sánchez Ríos', 'pedro@demo.com', '+51978901234', '55667788',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Av. Arequipa 3800, San Isidro, Lima, Lima, Peru; -12.1020,-77.0356',
 'transportista', 'activo', ''),
('Ana Martínez Flores', 'ana@demo.com', '+51956789012', '99887766',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Calle Bolognesi 720, Barranco, Lima, Lima, Peru; -12.1443,-77.0228',
 'transportista', 'activo', ''),
('Admin QUIVE', 'admin@demo.com', '+51999888777', '00000000',
 '$2b$12$t5MwNoBM6/ky1p8uRdOwqukgy9R3RK.xe.69lRSnAVrh8KxilVWUK',
 'Sede Central QUIVE, San Isidro, Lima, Peru',
 'admin', 'activo', '');

-- ====== Vehículos de transportistas demo ======
INSERT INTO Vehiculos (id_usuario, id_tipo_vehiculo, placa, estado) VALUES
(3, 2, 'ABC-123', 'activo'),
(4, 3, 'XYZ-789', 'activo'),
(5, 1, 'DEF-456', 'activo');

-- ====== Documentos de transportistas ======
INSERT INTO Documentos_Transportista (id_usuario, licencia_conducir_url, tarjeta_propiedad_url, certificado_itv_url, estado_verificacion) VALUES
(3, 'https://ejemplo.com/licencia_juan.pdf', 'https://ejemplo.com/tarjeta_juan.pdf', 'https://ejemplo.com/itv_juan.pdf', 'verificado'),
(4, 'https://ejemplo.com/licencia_pedro.pdf', 'https://ejemplo.com/tarjeta_pedro.pdf', 'https://ejemplo.com/itv_pedro.pdf', 'verificado'),
(5, 'https://ejemplo.com/licencia_ana.pdf', 'https://ejemplo.com/tarjeta_ana.pdf', 'https://ejemplo.com/itv_ana.pdf', 'verificado');

-- ====== Tarifas de transportistas ======
INSERT INTO Tarifas_Transportista (id_transportista, precio_por_m3, precio_por_kg, precio_por_km, recargo_fragil, recargo_embalaje) VALUES
(3, 15.00, 0.50, 2.50, 10.00, 8.00),
(4, 12.00, 0.40, 2.00, 12.00, 10.00),
(5, 18.00, 0.60, 3.00, 8.00, 6.00);

-- ====== Pasarela de pagos simulada ======
INSERT INTO Yape (codigo, titular, saldo, activo) VALUES
('YAPE001', 'Carlos García', 500.00, TRUE),
('YAPE002', 'María Rodriguez', 300.00, TRUE),
('YAPE003', 'Juan Torres', 1000.00, TRUE);

INSERT INTO PayPal (correo, contrasena, titular, saldo, activo) VALUES
('carlos@demo.com', 'demo1234', 'Carlos García', 800.00, TRUE),
('juan@demo.com', 'demo1234', 'Juan Torres', 1500.00, TRUE);

INSERT INTO Tarjeta (numero, cvv, vencimiento, titular, saldo, activo) VALUES
('4111111111111111', '123', '12/28', 'Carlos García', 2000.00, TRUE),
('5500000000000004', '456', '06/27', 'Pedro Sánchez', 1800.00, TRUE);

-- ====== Métodos de pago vinculados ======
INSERT INTO Metodos_Pago_Usuario (usuario_id, tipo_metodo, id_metodo_externo) VALUES
(1, 'Yape', 1),
(1, 'Tarjeta', 1),
(2, 'Yape', 2),
(3, 'Yape', 3),
(3, 'PayPal', 2),
(4, 'Tarjeta', 2);

-- ====== Marcar cuentas demo ======
UPDATE Usuarios SET es_demo = TRUE WHERE email LIKE '%@demo.com';
