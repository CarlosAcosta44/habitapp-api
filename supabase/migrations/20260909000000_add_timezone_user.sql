-- Agregar zona horaria a la tabla usuarios
ALTER TABLE seguimiento.usuarios ADD COLUMN IF NOT EXISTS zona_horaria VARCHAR(100);
