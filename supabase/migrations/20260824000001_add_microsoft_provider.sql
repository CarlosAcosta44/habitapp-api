-- Migración: Cambiar proveedor 'apple' por 'microsoft' en el CHECK constraint
-- de gestion.identidades

-- 1. Eliminar el constraint actual
ALTER TABLE gestion.identidades
  DROP CONSTRAINT IF EXISTS identidades_provider_check;

-- 2. Agregar el nuevo constraint con 'microsoft' en lugar de 'apple'
ALTER TABLE gestion.identidades
  ADD CONSTRAINT identidades_provider_check
  CHECK (provider IN ('google', 'facebook', 'microsoft', 'local'));
