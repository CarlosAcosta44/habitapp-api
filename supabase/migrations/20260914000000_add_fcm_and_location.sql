-- Migración para añadir fcm_token a usuarios y soporte de geolocalización a entrenadores

-- 1. Añadir fcm_token a gestion.usuarios
ALTER TABLE gestion.usuarios 
ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);

-- 2. Añadir latitud y longitud a seguimiento.entrenadores
ALTER TABLE seguimiento.entrenadores
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);

-- Índice para búsqueda por coordenadas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_entrenadores_lat_lng ON seguimiento.entrenadores (latitud, longitud);
