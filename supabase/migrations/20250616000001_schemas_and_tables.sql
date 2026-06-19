/*====================================================
  SISTEMA DE HÁBITOS SALUDABLES
  Script SQL Final - Supabase (PostgreSQL)
  
  IMPORTANTE: Este script asume que Supabase Auth
  ya está activo. La tabla auth.users es creada y
  gestionada automáticamente por Supabase.
====================================================*/

/*====================================================
  CREAR ESQUEMAS
====================================================*/
CREATE SCHEMA gestion;
CREATE SCHEMA comunidad;
CREATE SCHEMA seguimiento;

/*====================================================
  ESQUEMA: GESTION
====================================================*/

-- Roles del sistema (3 tipos fijos)
CREATE TABLE gestion.roles (
    idrol       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombrerol   VARCHAR(45) NOT NULL CHECK (nombrerol IN ('Usuario', 'Entrenador', 'Administrador')),
    descripcion VARCHAR(100)
);

-- Tabla que extiende auth.users con datos del perfil
-- idusuario referencia directamente a auth.users(id)
CREATE TABLE gestion.usuarios (
    idusuario       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre          VARCHAR(45)  NOT NULL,
    apellido        VARCHAR(45)  NOT NULL,
    telefono        VARCHAR(20),
    genero          VARCHAR(20)  CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
    fechanacimiento DATE,
    fotoperfil      VARCHAR(200),
    estado          VARCHAR(20)  NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
    puntostotales   INT          NOT NULL DEFAULT 0,
    idrol           UUID         NOT NULL,
    FOREIGN KEY (idrol) REFERENCES gestion.roles(idrol)
);

-- Datos extra solo para administradores
CREATE TABLE gestion.administradores (
    idadministrador UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    estadoadmin     VARCHAR(20) CHECK (estadoadmin IN ('Activo', 'Inactivo')),
    idusuario       UUID        NOT NULL UNIQUE,
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario)
);

-- Historial de puntos ganados por el usuario
CREATE TABLE gestion.historial_puntos (
    idhistorial UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    puntos      INT         NOT NULL,
    motivo      VARCHAR(100) NOT NULL,
    fecha       DATE        NOT NULL DEFAULT CURRENT_DATE,
    idusuario   UUID        NOT NULL,
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario)
);

-- Notificaciones del sistema para los usuarios
CREATE TABLE gestion.notificaciones (
    idnotificacion UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    mensaje        VARCHAR(200) NOT NULL,
    tipo           VARCHAR(45)  CHECK (tipo IN ('Habito', 'Comunidad', 'Entrenador', 'Sistema')),
    leida          BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idusuario      UUID         NOT NULL,
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario)
);

-- 1. Gestión de Amistades / Red de Apoyo (Añadido desde UI Extensions)
CREATE TABLE gestion.amigos (
    idamistad UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idusuario_solicitante UUID NOT NULL,
    idusuario_receptor    UUID NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aceptado', 'Rechazado', 'Bloqueado')),
    fechasolicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    fecharespuesta DATE,
    FOREIGN KEY (idusuario_solicitante) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
    FOREIGN KEY (idusuario_receptor) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
    CHECK (idusuario_solicitante <> idusuario_receptor)
);

CREATE UNIQUE INDEX unique_amistad_relacion 
ON gestion.amigos (
    LEAST(idusuario_solicitante, idusuario_receptor), 
    GREATEST(idusuario_solicitante, idusuario_receptor)
);

-- 2. Catálogo de Logros e Insignias del Sistema
CREATE TABLE gestion.logros (
    idlogro UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300) NOT NULL,
    icono VARCHAR(20) NOT NULL, 
    puntos_recompensa INT DEFAULT 0,
    tipo VARCHAR(50) DEFAULT 'General'
);

-- 3. Logros Obtenidos por los Usuarios
CREATE TABLE gestion.usuario_logro (
    idusuario UUID NOT NULL,
    idlogro UUID NOT NULL,
    fechaobtenido DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (idusuario, idlogro),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
    FOREIGN KEY (idlogro) REFERENCES gestion.logros(idlogro) ON DELETE CASCADE
);


/*====================================================
  ESQUEMA: SEGUIMIENTO
====================================================*/

-- Datos extra solo para entrenadores
CREATE TABLE seguimiento.entrenadores (
    identrenador  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    especialidad  VARCHAR(45),
    certificacion VARCHAR(100),
    experiencia   INT,
    idusuario     UUID        NOT NULL UNIQUE,
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario)
);

-- Relación usuarios con entrenadores (muchos a muchos)
CREATE TABLE seguimiento.usuario_entrenador (
    idusuario    UUID NOT NULL,
    identrenador UUID NOT NULL,
    fechainicio  DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (idusuario, identrenador),
    FOREIGN KEY (idusuario)    REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador)
);

-- Perfil de salud (tabla separada para guardar historial de cambios)
CREATE TABLE seguimiento.perfil_salud (
    idperfil       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    peso           DECIMAL(5,2),
    altura         DECIMAL(5,2),
    nivelactividad VARCHAR(20) CHECK (nivelactividad IN ('Sedentario', 'Moderado', 'Activo', 'Muy Activo')),
    objetivo       VARCHAR(100),
    fecha          DATE        NOT NULL DEFAULT CURRENT_DATE,
    idusuario      UUID        NOT NULL,
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario)
);

-- Categorías de hábitos predefinidas
CREATE TABLE seguimiento.categorias_habitos (
    idcategoria UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      VARCHAR(45)  NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- Hábitos/retos de los usuarios
CREATE TABLE seguimiento.habitos (
    idhabito      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(45)  NOT NULL,
    descripcion   VARCHAR(200),
    meta_diaria   INT          NOT NULL DEFAULT 1,
    unidad_medida VARCHAR(30)  NOT NULL DEFAULT 'veces',
    fechainicio   DATE         NOT NULL DEFAULT CURRENT_DATE,
    fechafin      DATE,
    estado        VARCHAR(20)  NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Completado')),
    puntos        INT          NOT NULL DEFAULT 0,
    idusuario     UUID         NOT NULL,
    idcategoria   UUID         NOT NULL,
    FOREIGN KEY (idusuario)   REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (idcategoria) REFERENCES seguimiento.categorias_habitos(idcategoria)
);

-- Registro diario de cumplimiento de hábitos (reto diario)
CREATE TABLE seguimiento.registro_habitos (
    idregistro      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha           DATE    NOT NULL DEFAULT CURRENT_DATE,
    completado      BOOLEAN NOT NULL DEFAULT FALSE,
    progreso_actual INT     NOT NULL DEFAULT 0,
    puntos_ganados  INT     NOT NULL DEFAULT 0,
    observacion     VARCHAR(200),
    idhabito        UUID    NOT NULL,
    idusuario       UUID    NOT NULL,
    FOREIGN KEY (idhabito)  REFERENCES seguimiento.habitos(idhabito),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario),
    UNIQUE (idhabito, idusuario, fecha) -- un registro por hábito por día
);

-- Recordatorios de hábitos
CREATE TABLE seguimiento.recordatorios (
    idrecordatorio UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    mensaje        VARCHAR(100) NOT NULL,
    hora           TIME         NOT NULL,
    frecuencia     VARCHAR(20)  NOT NULL CHECK (frecuencia IN ('Diario', 'Semanal', 'Mensual')),
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    idhabito       UUID         NOT NULL,
    FOREIGN KEY (idhabito) REFERENCES seguimiento.habitos(idhabito)
);

-- Rutinas creadas por entrenadores
CREATE TABLE seguimiento.rutinas (
    idrutina     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo         VARCHAR(30)  NOT NULL,
    descripcion  VARCHAR(500),
    duracion     INT,
    objetivo     VARCHAR(200),
    nivel        VARCHAR(20)  NOT NULL CHECK (nivel IN ('Principiante', 'Intermedio', 'Avanzado')),
    identrenador UUID         NOT NULL,
    FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador)
);

-- Asignación de rutinas a usuarios
CREATE TABLE seguimiento.usuario_rutina (
    idusuario   UUID NOT NULL,
    idrutina    UUID NOT NULL,
    fechainicio DATE NOT NULL DEFAULT CURRENT_DATE,
    estado      VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Completado', 'Abandonado')),
    PRIMARY KEY (idusuario, idrutina),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (idrutina)  REFERENCES seguimiento.rutinas(idrutina)
);

-- Seguimientos/reportes del entrenador sobre el usuario
CREATE TABLE seguimiento.seguimientos (
    idseguimiento UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha         DATE         NOT NULL DEFAULT CURRENT_DATE,
    progreso      VARCHAR(100),
    observaciones VARCHAR(200),
    identrenador  UUID         NOT NULL,
    idusuario     UUID         NOT NULL,
    FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador),
    FOREIGN KEY (idusuario)    REFERENCES gestion.usuarios(idusuario)
);

/*====================================================
  ESQUEMA: COMUNIDAD
====================================================*/

-- Foros de discusión
CREATE TABLE comunidad.foros (
    idforo        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo        VARCHAR(45)  NOT NULL,
    descripcion   VARCHAR(200),
    categoria     VARCHAR(45),
    estado        VARCHAR(20)  NOT NULL DEFAULT 'Abierto' CHECK (estado IN ('Abierto', 'Cerrado')),
    fechacreacion DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- Comentarios dentro de foros (soporta respuestas anidadas)
CREATE TABLE comunidad.comentarios (
    idcomentario       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    contenido          VARCHAR(500) NOT NULL,
    fechapublicacion   DATE         NOT NULL DEFAULT CURRENT_DATE,
    idcomentario_padre UUID,
    idforo             UUID         NOT NULL,
    idusuario          UUID         NOT NULL,
    FOREIGN KEY (idforo)             REFERENCES comunidad.foros(idforo),
    FOREIGN KEY (idusuario)          REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (idcomentario_padre) REFERENCES comunidad.comentarios(idcomentario)
);

-- Artículos informativos
CREATE TABLE comunidad.articulos (
    idarticulo       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo           VARCHAR(100) NOT NULL,
    contenido        VARCHAR(5000) NOT NULL,
    categoria        VARCHAR(45),
    estado           VARCHAR(20)  NOT NULL DEFAULT 'Publicado' CHECK (estado IN ('Borrador', 'Publicado', 'Archivado')),
    fechapublicacion DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- Reacciones a comentarios y artículos
CREATE TABLE comunidad.reacciones (
    idreaccion   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo         VARCHAR(20)  NOT NULL CHECK (tipo IN ('Me gusta', 'Me motiva', 'Util')),
    idusuario    UUID         NOT NULL,
    idcomentario UUID,
    idarticulo   UUID,
    FOREIGN KEY (idusuario)    REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (idcomentario) REFERENCES comunidad.comentarios(idcomentario),
    FOREIGN KEY (idarticulo)   REFERENCES comunidad.articulos(idarticulo),
    CHECK (
        (idcomentario IS NOT NULL AND idarticulo IS NULL) OR
        (idcomentario IS NULL     AND idarticulo IS NOT NULL)
    ),
    UNIQUE (idusuario, idcomentario),
    UNIQUE (idusuario, idarticulo)
);

-- Administradores que gestionan foros
CREATE TABLE comunidad.foro_administrador (
    idforo          UUID NOT NULL,
    idadministrador UUID NOT NULL,
    PRIMARY KEY (idforo, idadministrador),
    FOREIGN KEY (idforo)          REFERENCES comunidad.foros(idforo),
    FOREIGN KEY (idadministrador) REFERENCES gestion.administradores(idadministrador)
);

-- Administradores que escriben artículos
CREATE TABLE comunidad.administrador_articulo (
    idadministrador UUID NOT NULL,
    idarticulo      UUID NOT NULL,
    PRIMARY KEY (idadministrador, idarticulo),
    FOREIGN KEY (idadministrador) REFERENCES gestion.administradores(idadministrador),
    FOREIGN KEY (idarticulo)      REFERENCES comunidad.articulos(idarticulo)
);

-- Usuarios suscritos a foros
CREATE TABLE comunidad.usuario_foro (
    idusuario UUID NOT NULL,
    idforo    UUID NOT NULL,
    PRIMARY KEY (idusuario, idforo),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario),
    FOREIGN KEY (idforo)    REFERENCES comunidad.foros(idforo)
);

-- 1. Catálogo de Retos Grupales (Añadido desde UI Extensions)
CREATE TABLE comunidad.retos (
    idreto UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    insignia_recompensa UUID, 
    puntos_recompensa INT DEFAULT 0,
    fechainicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fechafin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Borrador', 'Activo', 'Finalizado')),
    FOREIGN KEY (insignia_recompensa) REFERENCES gestion.logros(idlogro) ON DELETE SET NULL
);

-- 2. Tareas que conforman un reto específico
CREATE TABLE comunidad.reto_tareas (
    idtarea UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    metrica_objetivo INT NOT NULL, 
    unidad_medida VARCHAR(20) NOT NULL, 
    icono VARCHAR(20), 
    idreto UUID NOT NULL,
    FOREIGN KEY (idreto) REFERENCES comunidad.retos(idreto) ON DELETE CASCADE
);

-- 3. Participación de Usuarios en Retos
CREATE TABLE comunidad.usuario_reto (
    idusuario UUID NOT NULL,
    idreto UUID NOT NULL,
    fechainscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'En Curso' CHECK (estado IN ('En Curso', 'Completado', 'Abandonado')),
    PRIMARY KEY (idusuario, idreto),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
    FOREIGN KEY (idreto) REFERENCES comunidad.retos(idreto) ON DELETE CASCADE
);

-- 4. Progreso de los Usuarios en las Tareas de los Retos
CREATE TABLE comunidad.usuario_tarea_progreso (
    idusuario UUID NOT NULL,
    idtarea UUID NOT NULL,
    valor_actual INT NOT NULL DEFAULT 0,
    completado BOOLEAN NOT NULL DEFAULT FALSE,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idusuario, idtarea),
    FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
    FOREIGN KEY (idtarea) REFERENCES comunidad.reto_tareas(idtarea) ON DELETE CASCADE
);


/*====================================================
  VISTA: RANKING DE USUARIOS
  La posición se calcula dinámicamente con ROW_NUMBER
====================================================*/
CREATE VIEW gestion.vista_ranking AS
SELECT
    ROW_NUMBER() OVER (ORDER BY puntostotales DESC) AS posicion,
    u.idusuario,
    u.nombre,
    u.apellido,
    u.fotoperfil,
    u.puntostotales
FROM gestion.usuarios u
WHERE u.estado = 'Activo'
ORDER BY u.puntostotales DESC;

/*====================================================
  TRIGGER: CREAR PERFIL AUTOMÁTICAMENTE
  
  Cuando un usuario se registra en Supabase Auth,
  este trigger crea automáticamente su registro
  en gestion.usuarios con el rol 'Usuario' por defecto.
====================================================*/
CREATE OR REPLACE FUNCTION gestion.crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO gestion.usuarios (idusuario, nombre, apellido, genero, fechanacimiento, idrol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre'),
        COALESCE(NEW.raw_user_meta_data->>'apellido', 'Sin apellido'),
        (NEW.raw_user_meta_data->>'genero'),
        (NEW.raw_user_meta_data->>'fechanacimiento')::DATE,
        (SELECT idrol FROM gestion.roles WHERE nombrerol = 'Usuario')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_crear_perfil
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION gestion.crear_perfil_usuario();

/*====================================================
  TRIGGER: SUMAR PUNTOS AL COMPLETAR HÁBITO
  
  Cuando se marca un registro_habito como completado,
  suma los puntos al usuario y guarda el historial.
====================================================*/
CREATE OR REPLACE FUNCTION seguimiento.sumar_puntos_habito()
RETURNS TRIGGER AS $$
DECLARE
    puntos_habito INT;
BEGIN
    -- 1. CASO: Hábito Marcado como Completado
    IF NEW.completado = TRUE AND (OLD.completado = FALSE OR OLD.completado IS NULL) THEN
        SELECT puntos INTO puntos_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;

        UPDATE gestion.usuarios
        SET puntostotales = puntostotales + puntos_habito
        WHERE idusuario = NEW.idusuario;

        INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
        VALUES (
            puntos_habito,
            'Hábito completado: ' || (SELECT nombre FROM seguimiento.habitos WHERE idhabito = NEW.idhabito),
            NEW.idusuario
        );
        NEW.puntos_ganados := puntos_habito;

    -- 2. CASO: Hábito Desmarcado (Revertir progreso)
    ELSIF NEW.completado = FALSE AND OLD.completado = TRUE THEN
        UPDATE gestion.usuarios
        SET puntostotales = puntostotales - OLD.puntos_ganados
        WHERE idusuario = NEW.idusuario;

        INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
        VALUES (
            -OLD.puntos_ganados,
            'Deshacer: Hábito ' || (SELECT nombre FROM seguimiento.habitos WHERE idhabito = NEW.idhabito),
            NEW.idusuario
        );
        NEW.puntos_ganados := 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sumar_puntos
    BEFORE UPDATE ON seguimiento.registro_habitos
    FOR EACH ROW
    EXECUTE FUNCTION seguimiento.sumar_puntos_habito();

/*====================================================
  DATOS INICIALES
====================================================*/

-- Roles base del sistema
INSERT INTO gestion.roles (nombrerol, descripcion) VALUES
    ('Usuario',       'Usuario regular del sistema'),
    ('Entrenador',    'Profesional que ofrece servicios de entrenamiento'),
    ('Administrador', 'Administrador con acceso total al sistema');

-- Categorías de hábitos predefinidas
INSERT INTO seguimiento.categorias_habitos (nombre, descripcion) VALUES
    ('Ejercicio',    'Actividades físicas y deportivas'),
    ('Nutrición',    'Hábitos alimenticios saludables'),
    ('Sueño',        'Rutinas y calidad del sueño'),
    ('Hidratación',  'Consumo adecuado de agua'),
    ('Salud Mental', 'Meditación, mindfulness y bienestar emocional'),
    ('Productividad','Organización y gestión del tiempo');

/*====================================================
  DATOS INICIALES EXTRAS (Dashboard UI)
====================================================*/

-- Logros en duro de la UI
INSERT INTO gestion.logros (nombre, descripcion, icono, puntos_recompensa)
VALUES 
    ('Sueño Profundo', '7 días durmiendo +8h', '🌙', 50),
    ('Ratón de Biblioteca', 'Leído 500 páginas este mes', '📚', 80),
    ('Corazón de Oro', 'Ayudaste a 10 amigos', '❤️', 100),
    ('Energía Pura', 'Sprint de 5km completado', '⚡', 75);

-- Reto principal de la UI
INSERT INTO comunidad.retos (titulo, descripcion, puntos_recompensa)
VALUES ('¡Mejores corredores!', 'Únete a 142 corredores esta semana y cumple las 4 tareas diarias.', 200);

-- Tareas simuladas para el reto
DO $$
DECLARE
    v_idreto UUID;
BEGIN
    SELECT idreto INTO v_idreto FROM comunidad.retos WHERE titulo = '¡Mejores corredores!' LIMIT 1;
    
    INSERT INTO comunidad.reto_tareas (nombre, metrica_objetivo, unidad_medida, icono, idreto)
    VALUES 
        ('Beber agua', 2000, 'ml', 'Droplet', v_idreto),
        ('Correr', 10000, 'pasos', 'Footprints', v_idreto),
        ('Tomar el sol', 4, 'veces', 'Flower2', v_idreto),
        ('Meditar', 30, 'minutos', 'Wind', v_idreto);
END $$;

/*====================================================
  VISTAS API PÚBLICAS
====================================================*/

CREATE OR REPLACE VIEW public.api_amigos AS SELECT * FROM gestion.amigos;
CREATE OR REPLACE VIEW public.api_logros AS SELECT * FROM gestion.logros;
CREATE OR REPLACE VIEW public.api_usuario_logro AS SELECT * FROM gestion.usuario_logro;
CREATE OR REPLACE VIEW public.api_historial_puntos AS SELECT * FROM gestion.historial_puntos;

GRANT SELECT ON public.api_amigos TO anon, authenticated;
GRANT SELECT ON public.api_logros TO anon, authenticated;
GRANT SELECT ON public.api_usuario_logro TO anon, authenticated;
GRANT SELECT ON public.api_historial_puntos TO anon, authenticated;