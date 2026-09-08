-- Modify chk_habitos_estado constraint to support 'Archivado' and 'Pausado'
ALTER TABLE seguimiento.habitos
  DROP CONSTRAINT IF EXISTS chk_habitos_estado;

ALTER TABLE seguimiento.habitos
  ADD CONSTRAINT chk_habitos_estado 
  CHECK (estado IN ('Activo', 'Inactivo', 'Completado', 'Archivado', 'Pausado'));
