-- ============================================================================
-- Migración: Logros Predefinidos de HabitApp (Catálogo Oficial de Gamificación)
-- Schema: gestion.logros
-- ============================================================================

INSERT INTO gestion.logros (nombre, descripcion, icono, puntos_recompensa, tipo)
VALUES
    -- ─── Categoría: Rachas de Hábitos (Streaks) ─────────────────────────────
    (
        'Primer Paso (7 días)',
        'Completa al menos un hábito durante 7 días consecutivos.',
        '🔥',
        50,
        'Racha'
    ),
    (
        'Hábito de Hierro (30 días)',
        'Mantén una racha activa de 30 días seguidos de hábitos.',
        '⚡',
        150,
        'Racha'
    ),
    (
        'Maestría Trimestral (90 días)',
        'Alcanza una racha legendaria de 90 días ininterrumpidos.',
        '🏆',
        350,
        'Racha'
    ),
    (
        'Disciplina de Acero (180 días)',
        'Supera medio año (180 días) con disciplina impecable.',
        '🛡️',
        700,
        'Racha'
    ),
    (
        'Leyenda Viviente (365 días)',
        'Un año completo (365 días) de transformación y consistencia.',
        '👑',
        1500,
        'Racha'
    ),

    -- ─── Categoría: Retos de la Comunidad (Community Challenges) ───────────
    (
        'Iniciado en Desafíos',
        'Inscríbete y completa con éxito tu primer reto comunitario.',
        '🎯',
        50,
        'Retos'
    ),
    (
        'Espíritu de Superación (5 retos)',
        'Conquista con éxito 5 retos comunitarios.',
        '🏅',
        150,
        'Retos'
    ),
    (
        'Campeón de la Comunidad (15 retos)',
        'Completa 15 desafíos y demuestra tu constancia grupal.',
        '🌟',
        350,
        'Retos'
    ),
    (
        'Titán de Retos (50 retos)',
        'Completa 50 retos comunitarios y conviértete en un referente.',
        '💎',
        1000,
        'Retos'
    ),

    -- ─── Categoría: Hábitos y Cumplimiento General ──────────────────────────
    (
        'Semilla de Cambio',
        'Crea y personaliza tu primer hábito en HabitApp.',
        '🌱',
        20,
        'Hábitos'
    ),
    (
        'Ritmo Imparable (50 completados)',
        'Registra 50 hábitos completados en tu historial.',
        '📈',
        100,
        'Hábitos'
    ),
    (
        'Maestro del Enfoque (250 completados)',
        'Alcanza la marca de 250 hábitos completados con éxito.',
        '🚀',
        350,
        'Hábitos'
    ),
    (
        'Arquitecto del Destino (1000 completados)',
        'Completa 1000 hábitos y consolida un nuevo estilo de vida.',
        '🏛️',
        1200,
        'Hábitos'
    ),

    -- ─── Categoría: Comunidad y Red de Apoyo ────────────────────────────────
    (
        'Inspirador Comunitario',
        'Comparte uno de tus hábitos favoritos con la comunidad.',
        '🤝',
        30,
        'Comunidad'
    ),
    (
        'Voz en el Foro',
        'Publica tu primer tema o duda en los foros de apoyo.',
        '💬',
        30,
        'Comunidad'
    ),
    (
        'Red Solidaria (10 aportes)',
        'Publica 10 respuestas constructivas para apoyar a otros miembros.',
        '💡',
        80,
        'Comunidad'
    )
ON CONFLICT (nombre) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    puntos_recompensa = EXCLUDED.puntos_recompensa,
    tipo = EXCLUDED.tipo;
