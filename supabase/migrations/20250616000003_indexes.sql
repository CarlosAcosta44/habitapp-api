/*====================================================
  ÍNDICES POSTGRESQL / SUPABASE
====================================================*/

-- ──────────────────────────────
-- gestion.usuarios
-- ──────────────────────────────
CREATE INDEX idx_usuarios_idrol
    ON gestion.usuarios (idrol);

CREATE INDEX idx_usuarios_estado
    ON gestion.usuarios (estado);

-- ──────────────────────────────
-- gestion.administradores
-- ──────────────────────────────
CREATE INDEX idx_administradores_estado
    ON gestion.administradores (estadoadmin);

-- ──────────────────────────────
-- seguimiento.habitos
-- ──────────────────────────────
CREATE INDEX idx_habitos_idusuario
    ON seguimiento.habitos (idusuario);

CREATE INDEX idx_habitos_estado
    ON seguimiento.habitos (estado);

CREATE INDEX idx_habitos_idcategoria
    ON seguimiento.habitos (idcategoria);

-- Índice compuesto: buscar hábitos activos de un usuario
CREATE INDEX idx_habitos_usuario_estado
    ON seguimiento.habitos (idusuario, estado)
    INCLUDE (nombre, puntos, fechainicio);

-- ──────────────────────────────
-- seguimiento.recordatorios
-- ──────────────────────────────
CREATE INDEX idx_recordatorios_idhabito
    ON seguimiento.recordatorios (idhabito);

-- ──────────────────────────────
-- seguimiento.rutinas
-- ──────────────────────────────
CREATE INDEX idx_rutinas_identrenador
    ON seguimiento.rutinas (identrenador);

CREATE INDEX idx_rutinas_tipo
    ON seguimiento.rutinas (tipo);

-- ──────────────────────────────
-- seguimiento.seguimientos
-- ──────────────────────────────
CREATE INDEX idx_seguimientos_idusuario
    ON seguimiento.seguimientos (idusuario);

CREATE INDEX idx_seguimientos_identrenador
    ON seguimiento.seguimientos (identrenador);

-- Índice compuesto: historial cronológico por usuario
CREATE INDEX idx_seguimientos_usuario_fecha
    ON seguimiento.seguimientos (idusuario, fecha DESC)
    INCLUDE (progreso, observaciones);

-- ──────────────────────────────
-- comunidad.comentarios
-- ──────────────────────────────
CREATE INDEX idx_comentarios_idforo
    ON comunidad.comentarios (idforo);

CREATE INDEX idx_comentarios_foro_fecha
    ON comunidad.comentarios (idforo, fechapublicacion DESC);

-- ──────────────────────────────
-- comunidad.foros
-- ──────────────────────────────
CREATE INDEX idx_foros_fechacreacion
    ON comunidad.foros (fechacreacion DESC);

-- ──────────────────────────────
-- comunidad.articulos
-- ──────────────────────────────
CREATE INDEX idx_articulos_fechapublicacion
    ON comunidad.articulos (fechapublicacion DESC);