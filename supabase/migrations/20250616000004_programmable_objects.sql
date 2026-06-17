-- ====================================================
-- 4. OBJETOS PROGRAMABLES - HabitApp (Supabase/PostgreSQL)
-- Estos objetos están diseñados para ejecutarse en el SQL Editor de Supabase.
-- Incluye: Funciones, Procedimientos, Triggers y Vistas.
-- ====================================================

-- ====================================================
-- SECCIÓN 1: FUNCIONES (Lógica de Retorno)
-- ====================================================

-- 1. Calcular racha actual de un hábito específico
CREATE OR REPLACE FUNCTION seguimiento.calcular_racha_actual(p_idhabito UUID)
RETURNS INT AS $$
DECLARE
    racha INT := 0;
    fecha_proc DATE := CURRENT_DATE;
    cumplido BOOLEAN;
BEGIN
    LOOP
        SELECT completado INTO cumplido FROM seguimiento.registro_habitos 
        WHERE idhabito = p_idhabito AND fecha = fecha_proc;
        IF cumplido = TRUE THEN
            racha := racha + 1;
            fecha_proc := fecha_proc - 1;
        ELSE EXIT; END IF;
    END LOOP;
    RETURN racha;
END;
$$ LANGUAGE plpgsql;

-- 2. Obtener el nivel del usuario basado en sus puntos
CREATE OR REPLACE FUNCTION gestion.get_nivel_usuario(p_puntos INT)
RETURNS TEXT AS $$
BEGIN
    IF p_puntos >= 1000 THEN RETURN 'Diamante';
    ELSIF p_puntos >= 500 THEN RETURN 'Oro';
    ELSIF p_puntos >= 200 THEN RETURN 'Plata';
    ELSE RETURN 'Bronce'; END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Calcular tasa de cumplimiento de los últimos 30 días
CREATE OR REPLACE FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario UUID)
RETURNS DECIMAL AS $$
DECLARE
    total INT;
    completados INT;
BEGIN
    SELECT COUNT(*) INTO total FROM seguimiento.registro_habitos 
    WHERE idusuario = p_idusuario AND fecha >= CURRENT_DATE - 30;
    SELECT COUNT(*) INTO completados FROM seguimiento.registro_habitos 
    WHERE idusuario = p_idusuario AND fecha >= CURRENT_DATE - 30 AND completado = TRUE;
    IF total = 0 THEN RETURN 0; END IF;
    RETURN (completados::DECIMAL / total) * 100;
END;
$$ LANGUAGE plpgsql;

-- 4. Sumar total de reacciones de un foro completo
CREATE OR REPLACE FUNCTION comunidad.total_reacciones_foro(p_idforo UUID)
RETURNS INT AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM comunidad.reacciones r
    JOIN comunidad.comentarios c ON r.idcomentario = c.idcomentario
    WHERE c.idforo = p_idforo);
END;
$$ LANGUAGE plpgsql;

-- 5. Validar si un hábito está dentro de su rango de fechas
CREATE OR REPLACE FUNCTION seguimiento.es_habito_vigente(p_idhabito UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.habitos 
        WHERE idhabito = p_idhabito 
        AND fechainicio <= CURRENT_DATE 
        AND (fechafin IS NULL OR fechafin >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Obtener el nombre completo del entrenador asignado
CREATE OR REPLACE FUNCTION seguimiento.get_nombre_entrenador(p_idusuario UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT u_pro.nombre || ' ' || u_pro.apellido
    FROM seguimiento.usuario_entrenador ue
    JOIN seguimiento.entrenadores e ON ue.identrenador = e.identrenador
    JOIN gestion.usuarios u_pro ON e.idusuario = u_pro.idusuario
    WHERE ue.idusuario = p_idusuario LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar disponibilidad de un foro para nuevos comentarios
CREATE OR REPLACE FUNCTION comunidad.foro_esta_abierto(p_idforo UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM comunidad.foros WHERE idforo = p_idforo AND estado = 'Abierto');
END;
$$ LANGUAGE plpgsql;

-- 8. Obtener cantidad total de usuarios registrados (Usado en AuthUI)
CREATE OR REPLACE FUNCTION public.get_total_usuarios()
RETURNS INTEGER AS $$
DECLARE v_total INTEGER;
BEGIN
    SELECT count(*) INTO v_total FROM gestion.usuarios;
    RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- SECCIÓN 2: PROCEDIMIENTOS (Acciones de Mutación)
-- ====================================================

-- 1. Crear hábito con recordatorio por defecto (Atómico)
CREATE OR REPLACE PROCEDURE seguimiento.crear_habito_completo(
    p_nombre VARCHAR, p_user UUID, p_cat UUID, p_hora TIME
) AS $$
DECLARE v_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO seguimiento.habitos (idhabito, nombre, idusuario, idcategoria)
    VALUES (v_id, p_nombre, p_user, p_cat);
    INSERT INTO seguimiento.recordatorios (mensaje, hora, frecuencia, idhabito)
    VALUES ('Hora de tu hábito: ' || p_nombre, p_hora, 'Diario', v_id);
END;
$$ LANGUAGE plpgsql;

-- 2. Asignar rol a un usuario con validación de existencia
CREATE OR REPLACE PROCEDURE gestion.asignar_rol(p_iduser UUID, p_nombrerol VARCHAR) AS $$
DECLARE v_idrol UUID;
BEGIN
    SELECT idrol INTO v_idrol FROM gestion.roles WHERE nombrerol = p_nombrerol;
    IF v_idrol IS NULL THEN RAISE EXCEPTION 'El rol % no existe', p_nombrerol; END IF;
    UPDATE gestion.usuarios SET idrol = v_idrol WHERE idusuario = p_iduser;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear foro y asignar administrador administrador inmediatamente
CREATE OR REPLACE PROCEDURE comunidad.crear_foro_admin(p_titulo VARCHAR, p_admin UUID) AS $$
DECLARE v_idforo UUID := gen_random_uuid();
BEGIN
    INSERT INTO comunidad.foros (idforo, titulo) VALUES (v_idforo, p_titulo);
    INSERT INTO comunidad.foro_administrador (idforo, idadministrador) VALUES (v_idforo, p_admin);
END;
$$ LANGUAGE plpgsql;

-- 4. Registrar cumplimiento masivo para los hábitos del día
CREATE OR REPLACE PROCEDURE seguimiento.completar_todo_hoy(p_iduser UUID) AS $$
BEGIN
    INSERT INTO seguimiento.registro_habitos (idhabito, idusuario, completado, fecha)
    SELECT idhabito, idusuario, TRUE, CURRENT_DATE FROM seguimiento.habitos
    WHERE idusuario = p_iduser AND estado = 'Activo'
    ON CONFLICT (idhabito, idusuario, fecha) DO UPDATE SET completado = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Ajuste manual de puntos (Auditoría)
CREATE OR REPLACE PROCEDURE gestion.corregir_puntos(p_iduser UUID, p_delta INT, p_motivo VARCHAR) AS $$
BEGIN
    UPDATE gestion.usuarios SET puntostotales = puntostotales + p_delta WHERE idusuario = p_iduser;
    INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario) VALUES (p_delta, p_motivo, p_iduser);
END;
$$ LANGUAGE plpgsql;

-- 6. Vincular usuario a entrenador de forma segura
CREATE OR REPLACE PROCEDURE seguimiento.vincular_cliente(p_iduser UUID, p_idpro UUID) AS $$
BEGIN
    INSERT INTO seguimiento.usuario_entrenador (idusuario, identrenador) VALUES (p_iduser, p_idpro)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 7. Limpiar notificaciones de más de 3 meses de antigüedad
CREATE OR REPLACE PROCEDURE gestion.limpiar_notificaciones_antiguas() AS $$
BEGIN
    DELETE FROM gestion.notificaciones WHERE fecha < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;


-- ====================================================
-- SECCIÓN 3: TRIGGERS (Automatización)
-- ====================================================

-- 1. Validar fechas de hábito (SECURITY DEFINER para triggers de RLS)
CREATE OR REPLACE FUNCTION seguimiento.tr_func_validar_fechas() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fechafin < NEW.fechainicio THEN 
        RAISE EXCEPTION 'Fechas inválidas'; 
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_fechas BEFORE INSERT OR UPDATE ON seguimiento.habitos
FOR EACH ROW EXECUTE FUNCTION seguimiento.tr_func_validar_fechas();

-- 2. Crear perfil automático al registrarse (Sync con Auth)
CREATE OR REPLACE FUNCTION gestion.tr_func_auto_perfil() RETURNS TRIGGER AS $$
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

-- 3. Notificar nuevo comentario en foro suscrito
CREATE OR REPLACE FUNCTION comunidad.tr_func_notif_coment() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO gestion.notificaciones (mensaje, idusuario)
    SELECT 'Nuevo comentario en: ' || (SELECT titulo FROM comunidad.foros WHERE idforo = NEW.idforo), idusuario
    FROM comunidad.usuario_foro WHERE idforo = NEW.idforo;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar puntaje global al ganar puntos en historial
CREATE OR REPLACE FUNCTION gestion.tr_func_sumar_total() RETURNS TRIGGER AS $$
BEGIN
    UPDATE gestion.usuarios SET puntostotales = puntostotales + NEW.puntos WHERE idusuario = NEW.idusuario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Limitar a máximo 20 hábitos activos por usuario
CREATE OR REPLACE FUNCTION seguimiento.tr_func_limite_habitos() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM seguimiento.habitos WHERE idusuario = NEW.idusuario AND estado = 'Activo') >= 20 THEN
        RAISE EXCEPTION 'Máximo 20 hábitos activos permitidos.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Impedir eliminar categorías de hábitos si tienen datos
CREATE OR REPLACE FUNCTION seguimiento.tr_func_proteger_cat() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM seguimiento.habitos WHERE idcategoria = OLD.idcategoria) THEN
        RAISE EXCEPTION 'No se puede borrar categoría con hábitos activos.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 7. Registrar fecha de última interacción en el usuario
CREATE OR REPLACE FUNCTION gestion.tr_func_touch_interaccion() RETURNS TRIGGER AS $$
BEGIN
    -- Aquí podríamos actualizar un campo de 'ultimo_acceso' si existiera
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 8. Sincronizar rol en auth.users
CREATE OR REPLACE FUNCTION gestion.sync_rol_a_auth()
RETURNS TRIGGER AS $$
DECLARE
    v_nombre_rol VARCHAR(45);
BEGIN
    SELECT nombrerol INTO v_nombre_rol FROM gestion.roles WHERE idrol = NEW.idrol;
    
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{rol}',
        to_jsonb(v_nombre_rol)
    )
    WHERE id = NEW.idusuario;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_rol_auth
    AFTER INSERT OR UPDATE OF idrol ON gestion.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION gestion.sync_rol_a_auth();

-- ====================================================
-- SECCIÓN 4: VISTAS (Consultas Simplificadas)
-- ====================================================

-- 1. Vista Pública de Perfiles (para consumo de la API Frontend)
CREATE OR REPLACE VIEW public.perfiles_usuarios_api AS
SELECT 
    u.idusuario,
    u.nombre,
    u.apellido,
    u.fotoperfil,
    u.puntostotales,
    u.idrol,
    r.nombrerol
FROM gestion.usuarios u
JOIN gestion.roles r ON u.idrol = r.idrol;

GRANT SELECT ON public.perfiles_usuarios_api TO anon, authenticated, service_role;

-- 2. Vista de Ranking con niveles dinámicos
CREATE OR REPLACE VIEW gestion.vista_resumen_ranking AS
SELECT idusuario, nombre, puntostotales, gestion.get_nivel_usuario(puntostotales) as nivel
FROM gestion.usuarios ORDER BY puntostotales DESC;

-- 2. Vista de progreso semanal (Habitos vs Registros)
CREATE OR REPLACE VIEW seguimiento.vista_progreso_semanal AS
SELECT h.nombre, COUNT(r.idregistro) as completados
FROM seguimiento.habitos h
LEFT JOIN seguimiento.registro_habitos r ON h.idhabito = r.idhabito
WHERE r.fecha >= CURRENT_DATE - 7 AND r.completado = TRUE
GROUP BY h.idhabito, h.nombre;

-- 3. Vista resumen de actividad en foros
CREATE OR REPLACE VIEW comunidad.vista_resumen_actividad AS
SELECT f.titulo, COUNT(DISTINCT c.idcomentario) as comentarios, COUNT(DISTINCT uf.idusuario) as miembros
FROM comunidad.foros f
LEFT JOIN comunidad.comentarios c ON f.idforo = c.idforo
LEFT JOIN comunidad.usuario_foro uf ON f.idforo = uf.idforo
GROUP BY f.idforo, f.titulo;

-- 4. Vista de hábitos vencidos o próximos a vencer (3 días)
CREATE OR REPLACE VIEW seguimiento.vista_auditoria_habitos AS
SELECT * FROM seguimiento.habitos 
WHERE fechafin <= CURRENT_DATE + 3 AND estado = 'Activo';

-- 5. Vista completa para Dashboard de Usuario
CREATE OR REPLACE VIEW seguimiento.vista_dashboard_usuario AS
SELECT u.idusuario, u.nombre, u.puntostotales, 
       seguimiento.tasa_cumplimiento_30d(u.idusuario) as performance_30d
FROM gestion.usuarios u;

-- 6. Vista de artículos más populares (Top 5)
CREATE OR REPLACE VIEW comunidad.vista_articulos_trending AS
SELECT a.titulo, COUNT(r.idreaccion) as popularidad
FROM comunidad.articulos a
LEFT JOIN comunidad.reacciones r ON a.idarticulo = r.idarticulo
GROUP BY a.idarticulo, a.titulo ORDER BY popularidad DESC LIMIT 5;

-- 7. Distribución de hábitos por categoría (KPI)
CREATE OR REPLACE VIEW seguimiento.vista_stats_categorias AS
SELECT c.nombre, COUNT(h.idhabito) as total
FROM seguimiento.categorias_habitos c
LEFT JOIN seguimiento.habitos h ON c.idcategoria = h.idcategoria
GROUP BY c.idcategoria, c.nombre;
