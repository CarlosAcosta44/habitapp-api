/*====================================================
  RESTRICCIONES Y ÚNICOS PARA POSTGRESQL / SUPABASE
====================================================*/

-- ──────────────────────────────
-- Roles
-- ──────────────────────────────
ALTER TABLE gestion.roles
ADD CONSTRAINT uq_roles_nombrerol UNIQUE (nombrerol);

-- ──────────────────────────────
-- Usuarios
-- ──────────────────────────────
-- No chequeamos correo porque lo maneja auth.users
ALTER TABLE gestion.usuarios
ADD CONSTRAINT chk_usuarios_genero CHECK (genero IN ('Masculino','Femenino','Otro')),
ADD CONSTRAINT chk_usuarios_estado CHECK (estado IN ('Activo','Inactivo','Suspendido'));

-- ──────────────────────────────
-- Administradores
-- ──────────────────────────────
ALTER TABLE gestion.administradores
ADD CONSTRAINT chk_administradores_estado CHECK (estadoadmin IN ('Activo','Inactivo'));

-- ──────────────────────────────
-- Hábitos
-- ──────────────────────────────
ALTER TABLE seguimiento.habitos
ADD CONSTRAINT chk_habitos_puntos CHECK (puntos >= 0),
ADD CONSTRAINT chk_habitos_estado CHECK (estado IN ('Activo','Inactivo','Completado'));

-- La categoría se valida con FK
ALTER TABLE seguimiento.habitos
ADD CONSTRAINT fk_habitos_categoria
FOREIGN KEY (idcategoria) REFERENCES seguimiento.categorias_habitos(idcategoria);

-- ──────────────────────────────
-- Rutinas
-- ──────────────────────────────
ALTER TABLE seguimiento.rutinas
ADD CONSTRAINT chk_rutinas_duracion CHECK (duracion >= 0),
ADD CONSTRAINT chk_rutinas_nivel CHECK (nivel IN ('Principiante','Intermedio','Avanzado'));

-- ──────────────────────────────
-- Recordatorios
-- ──────────────────────────────
ALTER TABLE seguimiento.recordatorios
ADD CONSTRAINT chk_recordatorios_frecuencia CHECK (frecuencia IN ('Diario','Semanal','Mensual'));

-- ──────────────────────────────
-- Comentarios
-- ──────────────────────────────
ALTER TABLE comunidad.comentarios
ADD CONSTRAINT chk_comentarios_contenido CHECK (char_length(btrim(contenido)) > 0);

-- ──────────────────────────────
-- Foros
-- ──────────────────────────────
ALTER TABLE comunidad.foros
ADD CONSTRAINT chk_foros_titulo CHECK (char_length(btrim(titulo)) > 0);

-- ──────────────────────────────
-- Artículos
-- ──────────────────────────────
ALTER TABLE comunidad.articulos
ADD CONSTRAINT chk_articulos_titulo CHECK (char_length(btrim(titulo)) > 0);


