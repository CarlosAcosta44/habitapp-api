-- ====================================================
-- SCRIPT DE DATOS SINTÉTICOS MASIVOS (HabitApp) v4.1
-- 
-- REQUISITOS:
--   1. Haber ejecutado node scripts/recreate-synthetic-users-v4.mjs
--      para crear los 25 usuarios en auth.users con contraseñas válidas.
--
-- ESTO GENERA: 
--   Hábitos, registros (30 días), comunidad, entrenadores.
-- ====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_coach_id UUID;
    v_admin_id UUID;
    v_cat_id UUID;
    v_habito_id UUID;
    v_foro_id UUID;
    v_articulo_id UUID;
    v_reto_id UUID;
    i INT;
    j INT;
    k INT;
BEGIN
    -- ================================================
    -- LIMPIEZA DE DATOS (NO TOCAMOS auth.users NI gestion.usuarios)
    -- ================================================

    -- Comunidad
    DELETE FROM comunidad.reacciones;
    DELETE FROM comunidad.comentarios;
    DELETE FROM comunidad.usuario_foro;
    DELETE FROM comunidad.foro_administrador;
    DELETE FROM comunidad.administrador_articulo;
    DELETE FROM comunidad.foros;
    DELETE FROM comunidad.articulos;

    -- Seguimiento
    DELETE FROM seguimiento.recordatorios;
    DELETE FROM seguimiento.registro_habitos;
    DELETE FROM seguimiento.habitos;
    DELETE FROM seguimiento.usuario_rutina;
    DELETE FROM seguimiento.rutinas;
    DELETE FROM seguimiento.seguimientos;
    DELETE FROM seguimiento.usuario_entrenador;
    DELETE FROM seguimiento.entrenadores;
    DELETE FROM seguimiento.perfil_salud;

    -- Gestión
    -- Gestión y UI
    DELETE FROM comunidad.usuario_tarea_progreso;
    DELETE FROM comunidad.usuario_reto;
    DELETE FROM gestion.usuario_logro;
    DELETE FROM gestion.amigos;
    DELETE FROM gestion.notificaciones;
    DELETE FROM gestion.historial_puntos;
    DELETE FROM gestion.administradores;

    -- ================================================
    -- CONFIGURACIÓN DE ROLES Y DATOS EXTRA (Usuarios ya existen)
    -- ================================================
    
    -- Los usuarios ya existen en gestion.usuarios por el trigger en auth.users.
    -- Vamos a asignar administradores (primeros 2) y entrenadores (3 al 7).
    
    -- Configurar Admins (primeros 2 por orden alfabético de email)
    INSERT INTO gestion.administradores (idadministrador, idusuario, estadoadmin)
    SELECT gen_random_uuid(), gu.idusuario, 'Activo'
    FROM gestion.usuarios gu
    JOIN auth.users au ON gu.idusuario = au.id
    WHERE au.email LIKE '%.habitapp@gmail.com'
    ORDER BY au.email ASC LIMIT 2;

    -- Entrenadores (usuarios 3 al 7)
    INSERT INTO seguimiento.entrenadores (identrenador, idusuario, especialidad, experiencia)
    SELECT gen_random_uuid(), gu.idusuario,
           (ARRAY['Fuerza', 'Yoga', 'Nutrición', 'Crossfit'])[((RANDOM()*3)+1)::INT],
           (RANDOM()*10+1)::INT
    FROM gestion.usuarios gu
    JOIN auth.users au ON gu.idusuario = au.id
    WHERE au.email LIKE '%.habitapp@gmail.com'
    ORDER BY au.email ASC OFFSET 2 LIMIT 5;

    -- Actualizar roles en gestion.usuarios
    UPDATE gestion.usuarios SET idrol = (SELECT idrol FROM gestion.roles WHERE nombrerol = 'Administrador')
    WHERE idusuario IN (SELECT idusuario FROM gestion.administradores);

    UPDATE gestion.usuarios SET idrol = (SELECT idrol FROM gestion.roles WHERE nombrerol = 'Entrenador')
    WHERE idusuario IN (SELECT idusuario FROM seguimiento.entrenadores);

    -- ================================================
    -- HÁBITOS, RECORDATORIOS Y REGISTROS (30 días)
    -- ================================================
    FOR v_user_id IN (
        SELECT gu.idusuario FROM gestion.usuarios gu
        JOIN auth.users au ON gu.idusuario = au.id
        JOIN gestion.roles r ON r.idrol = gu.idrol
        WHERE r.nombrerol = 'Usuario' AND au.email LIKE '%.habitapp@gmail.com'
    ) LOOP
        FOR j IN 1..3 LOOP
            v_cat_id    := (SELECT idcategoria FROM seguimiento.categorias_habitos ORDER BY RANDOM() LIMIT 1);
            v_habito_id := gen_random_uuid();

            INSERT INTO seguimiento.habitos (idhabito, nombre, idusuario, idcategoria, puntos)
            VALUES (
                v_habito_id,
                'Hábito ' || j || ' de ' || (SELECT email FROM auth.users WHERE id = v_user_id),
                v_user_id, v_cat_id,
                (RANDOM()*20+5)::INT
            );

            INSERT INTO seguimiento.recordatorios (mensaje, hora, frecuencia, idhabito)
            VALUES (
                'Hora de actividad', '08:00:00'::TIME + (INTERVAL '1 hour' * j),
                'Diario', v_habito_id
            );

            FOR k IN 0..30 LOOP
                INSERT INTO seguimiento.registro_habitos (idhabito, idusuario, fecha, completado, puntos_ganados)
                VALUES (v_habito_id, v_user_id, CURRENT_DATE - k, (RANDOM() > 0.3), 10)
                ON CONFLICT (idhabito, idusuario, fecha) DO NOTHING;
            END LOOP;
        END LOOP;

        -- Perfil de salud (IDUSUARIO no tiene restricción única, pero ya limpiamos la tabla arriba)
        INSERT INTO seguimiento.perfil_salud (peso, altura, nivelactividad, idusuario)
        VALUES (RANDOM()*40+50, RANDOM()*0.5+1.5, 'Moderado', v_user_id);
    END LOOP;

    -- ================================================
    -- COMUNIDAD: FOROS, ARTÍCULOS, COMENTARIOS
    -- ================================================
    FOR i IN 1..5 LOOP
        v_foro_id := gen_random_uuid();
        INSERT INTO comunidad.foros (idforo, titulo, descripcion, categoria)
        VALUES (v_foro_id, 'Foro de Salud ' || i, 'Hablemos sobre bienestar ' || i, 'General');

        v_admin_id := (SELECT idadministrador FROM gestion.administradores LIMIT 1);
        IF v_admin_id IS NOT NULL THEN
            INSERT INTO comunidad.foro_administrador (idforo, idadministrador) VALUES (v_foro_id, v_admin_id);
        END IF;

        FOR j IN 1..5 LOOP
            v_user_id := (
                SELECT gu.idusuario FROM gestion.usuarios gu
                JOIN auth.users au ON gu.idusuario = au.id
                JOIN gestion.roles r ON r.idrol = gu.idrol
                WHERE r.nombrerol = 'Usuario' AND au.email LIKE '%.habitapp@gmail.com'
                ORDER BY RANDOM() LIMIT 1
            );
            IF v_user_id IS NOT NULL THEN
                INSERT INTO comunidad.usuario_foro (idusuario, idforo)
                VALUES (v_user_id, v_foro_id) ON CONFLICT DO NOTHING;

                INSERT INTO comunidad.comentarios (idcomentario, contenido, idforo, idusuario)
                VALUES (gen_random_uuid(), 'Me parece un excelente tema.', v_foro_id, v_user_id);
            END IF;
        END LOOP;
    END LOOP;

    FOR i IN 1..10 LOOP
        v_articulo_id := gen_random_uuid();
        INSERT INTO comunidad.articulos (idarticulo, titulo, contenido, categoria)
        VALUES (v_articulo_id, 'Artículo Educativo ' || i, 'Información sobre hábitos saludables.', 'Salud');

        v_admin_id := (SELECT idadministrador FROM gestion.administradores LIMIT 1);
        IF v_admin_id IS NOT NULL THEN
            INSERT INTO comunidad.administrador_articulo (idadministrador, idarticulo) VALUES (v_admin_id, v_articulo_id);
        END IF;

        FOR j IN 1..5 LOOP
            v_user_id := (
                SELECT gu.idusuario FROM gestion.usuarios gu
                JOIN auth.users au ON gu.idusuario = au.id
                WHERE au.email LIKE '%.habitapp@gmail.com' 
                ORDER BY RANDOM() LIMIT 1
            );
            IF v_user_id IS NOT NULL THEN
                INSERT INTO comunidad.reacciones (tipo, idusuario, idarticulo)
                VALUES (
                    (ARRAY['Me gusta', 'Util', 'Me motiva'])[((RANDOM()*2)+1)::INT],
                    v_user_id, v_articulo_id
                ) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    -- Notificaciones de Bienvenida
    INSERT INTO gestion.notificaciones (mensaje, tipo, idusuario)
    SELECT '¡Tu perfil está listo! Explora tus nuevos hábitos.', 'Sistema', gu.idusuario
    FROM gestion.usuarios gu
    JOIN auth.users au ON gu.idusuario = au.id
    WHERE au.email LIKE '%.habitapp@gmail.com';

    -- ================================================
    -- NUEVOS MÓDULOS DE UI (Logros, Retos, Amigos)
    -- ================================================
    
    -- Inyectar interacciones aleatorias en los nuevos Módulos para los usuarios sintéticos
    FOR v_user_id IN (SELECT au.id FROM auth.users au WHERE au.email LIKE '%.habitapp@gmail.com') LOOP
        
        -- 1. Asignar Logros Aleatorios
        INSERT INTO gestion.usuario_logro (idusuario, idlogro, fechaobtenido)
        SELECT v_user_id, idlogro, CURRENT_DATE - (RANDOM() * 30)::INT
        FROM gestion.logros
        ORDER BY RANDOM() LIMIT 2
        ON CONFLICT DO NOTHING;
        
        -- 2. Inscribir usuarios al Gran Reto "¡Mejores corredores!"
        v_reto_id := (SELECT idreto FROM comunidad.retos LIMIT 1);
        IF v_reto_id IS NOT NULL THEN
            -- Añadirlo al reto
            INSERT INTO comunidad.usuario_reto (idusuario, idreto, estado)
            VALUES (v_user_id, v_reto_id, 'En Curso')
            ON CONFLICT DO NOTHING;
            
            -- Poner progreso aleatorio en tareas de ese reto
            INSERT INTO comunidad.usuario_tarea_progreso (idusuario, idtarea, valor_actual, completado)
            SELECT v_user_id, rt.idtarea, (RANDOM() * rt.metrica_objetivo)::INT, (RANDOM() > 0.5)
            FROM comunidad.reto_tareas rt WHERE rt.idreto = v_reto_id
            ON CONFLICT DO NOTHING;
        END IF;

    END LOOP;

    -- 3. Crear Amistades Aleatorias (Red de Apoyo)
    -- Cada usuario recibe ~3 amigos de la lista sintética
    FOR v_user_id IN (SELECT au.id FROM auth.users au WHERE au.email LIKE '%.habitapp@gmail.com') LOOP
        INSERT INTO gestion.amigos (idusuario_solicitante, idusuario_receptor, estado)
        SELECT v_user_id, au2.id, 'Aceptado'
        FROM auth.users au2 
        WHERE au2.id != v_user_id AND au2.email LIKE '%.habitapp@gmail.com'
        ORDER BY RANDOM() LIMIT 3
        ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Datos masivos generados para 25 usuarios.';
    RAISE NOTICE '📧 Prueba login: sofia6.habitapp@gmail.com / HabitApp123!';

END $$;
