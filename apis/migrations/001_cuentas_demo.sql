-- ============================================================
-- 001 — Identificación explícita de cuentas demo
-- ============================================================
-- Hasta ahora una cuenta demo solo se distinguía por el sufijo @demo.com del correo.
-- Esta columna permite:
--   * mostrar el distintivo "CUENTA DEMO" en la interfaz,
--   * aislar a los transportistas demo de los clientes reales (y viceversa)
--     en la búsqueda de candidatos para una solicitud.
--
-- Es idempotente: se puede ejecutar más de una vez.
--   psql "$DATABASE_URL" -f migrations/001_cuentas_demo.sql

ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS es_demo BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE Usuarios
SET es_demo = TRUE
WHERE email IN (
    'carlos@demo.com', 'maria@demo.com',
    'juan@demo.com', 'pedro@demo.com', 'ana@demo.com',
    'admin@demo.com'
);
