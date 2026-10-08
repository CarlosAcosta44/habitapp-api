/*====================================================
  FUNCIONES, PROCEDIMIENTOS Y TRIGGERS
====================================================*/
--
-- Name: crear_foro_admin(character varying, uuid); Type: PROCEDURE; Schema: comunidad; Owner: postgres
--

CREATE PROCEDURE comunidad.crear_foro_admin(IN p_titulo character varying, IN p_admin uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE v_idforo UUID := gen_random_uuid();
BEGIN
    INSERT INTO comunidad.foros (idforo, titulo) VALUES (v_idforo, p_titulo);
    INSERT INTO comunidad.foro_administrador (idforo, idadministrador) VALUES (v_idforo, p_admin);
END;
$$;


ALTER PROCEDURE comunidad.crear_foro_admin(IN p_titulo character varying, IN p_admin uuid) OWNER TO postgres;

--
-- Name: foro_esta_abierto(uuid); Type: FUNCTION; Schema: comunidad; Owner: postgres
--

CREATE FUNCTION comunidad.foro_esta_abierto(p_idforo uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM comunidad.foros WHERE idforo = p_idforo AND estado = 'Abierto');
END;
$$;


ALTER FUNCTION comunidad.foro_esta_abierto(p_idforo uuid) OWNER TO postgres;

--
-- Name: total_reacciones_foro(uuid); Type: FUNCTION; Schema: comunidad; Owner: postgres
--

CREATE FUNCTION comunidad.total_reacciones_foro(p_idforo uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM comunidad.reacciones r
    JOIN comunidad.comentarios c ON r.idcomentario = c.idcomentario
    WHERE c.idforo = p_idforo);
END;
$$;


ALTER FUNCTION comunidad.total_reacciones_foro(p_idforo uuid) OWNER TO postgres;

--
-- Name: tr_func_notif_coment(); Type: FUNCTION; Schema: comunidad; Owner: postgres
--

CREATE FUNCTION comunidad.tr_func_notif_coment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO gestion.notificaciones (mensaje, idusuario)
    SELECT 'Nuevo comentario en: ' || (SELECT titulo FROM comunidad.foros WHERE idforo = NEW.idforo), idusuario
    FROM comunidad.usuario_foro WHERE idforo = NEW.idforo;
    RETURN NEW;
END;
$$;


ALTER FUNCTION comunidad.tr_func_notif_coment() OWNER TO postgres;

--
-- Name: asignar_rol(uuid, character varying); Type: PROCEDURE; Schema: gestion; Owner: postgres
--

CREATE PROCEDURE gestion.asignar_rol(IN p_iduser uuid, IN p_nombrerol character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE v_idrol UUID;
BEGIN
    SELECT idrol INTO v_idrol FROM gestion.roles WHERE nombrerol = p_nombrerol;
    IF v_idrol IS NULL THEN RAISE EXCEPTION 'El rol % no existe', p_nombrerol; END IF;
    UPDATE gestion.usuarios SET idrol = v_idrol WHERE idusuario = p_iduser;
END;
$$;


ALTER PROCEDURE gestion.asignar_rol(IN p_iduser uuid, IN p_nombrerol character varying) OWNER TO postgres;

--
-- Name: corregir_puntos(uuid, integer, character varying); Type: PROCEDURE; Schema: gestion; Owner: postgres
--

CREATE PROCEDURE gestion.corregir_puntos(IN p_iduser uuid, IN p_delta integer, IN p_motivo character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE gestion.usuarios SET puntostotales = puntostotales + p_delta WHERE idusuario = p_iduser;
    INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario) VALUES (p_delta, p_motivo, p_iduser);
END;
$$;


ALTER PROCEDURE gestion.corregir_puntos(IN p_iduser uuid, IN p_delta integer, IN p_motivo character varying) OWNER TO postgres;

--
-- Name: es_admin(); Type: FUNCTION; Schema: gestion; Owner: postgres
--

CREATE FUNCTION gestion.es_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM gestion.administradores 
        WHERE idusuario = auth.uid() AND estadoadmin = 'Activo'
    );
END;
$$;


ALTER FUNCTION gestion.es_admin() OWNER TO postgres;

--
-- Name: get_nivel_usuario(integer); Type: FUNCTION; Schema: gestion; Owner: postgres
--

CREATE FUNCTION gestion.get_nivel_usuario(p_puntos integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF p_puntos >= 1000 THEN RETURN 'Diamante';
    ELSIF p_puntos >= 500 THEN RETURN 'Oro';
    ELSIF p_puntos >= 200 THEN RETURN 'Plata';
    ELSE RETURN 'Bronce'; END IF;
END;
$$;


ALTER FUNCTION gestion.get_nivel_usuario(p_puntos integer) OWNER TO postgres;

--
-- Name: get_total_usuarios(); Type: FUNCTION; Schema: gestion; Owner: postgres
--

CREATE FUNCTION gestion.get_total_usuarios() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE v_total INTEGER;
BEGIN
    SELECT count(*) INTO v_total FROM gestion.usuarios;
    RETURN v_total;
END;
$$;


ALTER FUNCTION gestion.get_total_usuarios() OWNER TO postgres;

--
-- Name: limpiar_notificaciones_antiguas(); Type: PROCEDURE; Schema: gestion; Owner: postgres
--

CREATE PROCEDURE gestion.limpiar_notificaciones_antiguas()
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM gestion.notificaciones WHERE fecha < CURRENT_DATE - INTERVAL '90 days';
END;
$$;


ALTER PROCEDURE gestion.limpiar_notificaciones_antiguas() OWNER TO postgres;

--
-- Name: tr_func_sumar_total(); Type: FUNCTION; Schema: gestion; Owner: postgres
--

CREATE FUNCTION gestion.tr_func_sumar_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE gestion.usuarios SET puntostotales = puntostotales + NEW.puntos WHERE idusuario = NEW.idusuario;
    RETURN NEW;
END;
$$;


ALTER FUNCTION gestion.tr_func_sumar_total() OWNER TO postgres;

--
-- Name: tr_func_touch_interaccion(); Type: FUNCTION; Schema: gestion; Owner: postgres
--

CREATE FUNCTION gestion.tr_func_touch_interaccion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Aquí podríamos actualizar un campo de 'ultimo_acceso' si existiera
    RETURN NEW;
END;
$$;


ALTER FUNCTION gestion.tr_func_touch_interaccion() OWNER TO postgres;

--
-- Name: aplicar_puntos_usuario(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.aplicar_puntos_usuario() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE diferencia INT; nombre_habito TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN diferencia := NEW.puntos_ganados;
    ELSE diferencia := NEW.puntos_ganados - COALESCE(OLD.puntos_ganados, 0);
    END IF;
    IF diferencia <> 0 THEN
        UPDATE gestion.usuarios SET puntostotales = puntostotales + diferencia WHERE idusuario = NEW.idusuario;
        SELECT nombre INTO nombre_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;
        IF diferencia > 0 THEN
            INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
            VALUES (diferencia, 'Habito completado: ' || COALESCE(nombre_habito, 'Desconocido'), NEW.idusuario);
        ELSE
            INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
            VALUES (diferencia, 'Deshacer: Habito ' || COALESCE(nombre_habito, 'Desconocido'), NEW.idusuario);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION seguimiento.aplicar_puntos_usuario() OWNER TO postgres;

--
-- Name: asignar_puntos_ganados(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.asignar_puntos_ganados() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE p_habito INT;
BEGIN
    IF NEW.completado = TRUE AND (TG_OP = 'INSERT' OR OLD.completado = FALSE OR OLD.completado IS NULL) THEN
        SELECT puntos INTO p_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;
        NEW.puntos_ganados := p_habito;
    ELSIF NEW.completado = FALSE THEN
        NEW.puntos_ganados := 0;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION seguimiento.asignar_puntos_ganados() OWNER TO postgres;

--
-- Name: calcular_racha_actual(uuid); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.calcular_racha_actual(p_idhabito uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION seguimiento.calcular_racha_actual(p_idhabito uuid) OWNER TO postgres;

--
-- Name: completar_todo_hoy(uuid); Type: PROCEDURE; Schema: seguimiento; Owner: postgres
--

CREATE PROCEDURE seguimiento.completar_todo_hoy(IN p_iduser uuid)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguimiento.registro_habitos (idhabito, idusuario, completado, fecha)
    SELECT idhabito, idusuario, TRUE, CURRENT_DATE FROM seguimiento.habitos
    WHERE idusuario = p_iduser AND estado = 'Activo'
    ON CONFLICT (idhabito, idusuario, fecha) DO UPDATE SET completado = TRUE;
END;
$$;


ALTER PROCEDURE seguimiento.completar_todo_hoy(IN p_iduser uuid) OWNER TO postgres;

--
-- Name: crear_habito_completo(character varying, uuid, uuid, time without time zone); Type: PROCEDURE; Schema: seguimiento; Owner: postgres
--

CREATE PROCEDURE seguimiento.crear_habito_completo(IN p_nombre character varying, IN p_user uuid, IN p_cat uuid, IN p_hora time without time zone)
    LANGUAGE plpgsql
    AS $$
DECLARE v_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO seguimiento.habitos (idhabito, nombre, idusuario, idcategoria)
    VALUES (v_id, p_nombre, p_user, p_cat);
    INSERT INTO seguimiento.recordatorios (mensaje, hora, frecuencia, idhabito)
    VALUES ('Hora de tu hábito: ' || p_nombre, p_hora, 'Diario', v_id);
END;
$$;


ALTER PROCEDURE seguimiento.crear_habito_completo(IN p_nombre character varying, IN p_user uuid, IN p_cat uuid, IN p_hora time without time zone) OWNER TO postgres;

--
-- Name: es_entrenador(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.es_entrenador() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.entrenadores 
        WHERE idusuario = auth.uid()
    );
END;
$$;


ALTER FUNCTION seguimiento.es_entrenador() OWNER TO postgres;

--
-- Name: es_entrenador_de(uuid); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.es_entrenador_de(p_id_usuario uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.usuario_entrenador ue
        JOIN seguimiento.entrenadores e ON ue.identrenador = e.identrenador
        WHERE ue.idusuario = p_id_usuario 
        AND e.idusuario = auth.uid()
    );
END;
$$;


ALTER FUNCTION seguimiento.es_entrenador_de(p_id_usuario uuid) OWNER TO postgres;

--
-- Name: es_habito_vigente(uuid); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.es_habito_vigente(p_idhabito uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.habitos 
        WHERE idhabito = p_idhabito 
        AND fechainicio <= CURRENT_DATE 
        AND (fechafin IS NULL OR fechafin >= CURRENT_DATE)
    );
END;
$$;


ALTER FUNCTION seguimiento.es_habito_vigente(p_idhabito uuid) OWNER TO postgres;

--
-- Name: get_nombre_entrenador(uuid); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.get_nombre_entrenador(p_idusuario uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (SELECT u_pro.nombre || ' ' || u_pro.apellido
    FROM seguimiento.usuario_entrenador ue
    JOIN seguimiento.entrenadores e ON ue.identrenador = e.identrenador
    JOIN gestion.usuarios u_pro ON e.idusuario = u_pro.idusuario
    WHERE ue.idusuario = p_idusuario LIMIT 1);
END;
$$;


ALTER FUNCTION seguimiento.get_nombre_entrenador(p_idusuario uuid) OWNER TO postgres;

--
-- Name: tasa_cumplimiento_30d(uuid); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario uuid) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario uuid) OWNER TO postgres;

--
-- Name: tr_func_limite_habitos(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.tr_func_limite_habitos() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT COUNT(*) FROM seguimiento.habitos WHERE idusuario = NEW.idusuario AND estado = 'Activo') >= 20 THEN
        RAISE EXCEPTION 'Máximo 20 hábitos activos permitidos.';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION seguimiento.tr_func_limite_habitos() OWNER TO postgres;

--
-- Name: tr_func_proteger_cat(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.tr_func_proteger_cat() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM seguimiento.habitos WHERE idcategoria = OLD.idcategoria) THEN
        RAISE EXCEPTION 'No se puede borrar categoría con hábitos activos.';
    END IF;
    RETURN OLD;
END;
$$;


ALTER FUNCTION seguimiento.tr_func_proteger_cat() OWNER TO postgres;

--
-- Name: tr_func_validar_fechas(); Type: FUNCTION; Schema: seguimiento; Owner: postgres
--

CREATE FUNCTION seguimiento.tr_func_validar_fechas() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.fechafin < NEW.fechainicio THEN 
        RAISE EXCEPTION 'Fechas inválidas'; 
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION seguimiento.tr_func_validar_fechas() OWNER TO postgres;

--
-- Name: vincular_cliente(uuid, uuid); Type: PROCEDURE; Schema: seguimiento; Owner: postgres
--

CREATE PROCEDURE seguimiento.vincular_cliente(IN p_iduser uuid, IN p_idpro uuid)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguimiento.usuario_entrenador (idusuario, identrenador) VALUES (p_iduser, p_idpro)
    ON CONFLICT DO NOTHING;
END;
$$;


ALTER PROCEDURE seguimiento.vincular_cliente(IN p_iduser uuid, IN p_idpro uuid) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: vista_articulos_trending; Type: VIEW; Schema: comunidad; Owner: postgres
--

CREATE VIEW comunidad.vista_articulos_trending AS
 SELECT a.titulo,
    count(r.idreaccion) AS popularidad
   FROM (comunidad.articulos a
     LEFT JOIN comunidad.reacciones r ON ((a.idarticulo = r.idarticulo)))
  GROUP BY a.idarticulo, a.titulo
  ORDER BY (count(r.idreaccion)) DESC
 LIMIT 5;


ALTER VIEW comunidad.vista_articulos_trending OWNER TO postgres;

--
-- Name: vista_resumen_actividad; Type: VIEW; Schema: comunidad; Owner: postgres
--

CREATE VIEW comunidad.vista_resumen_actividad AS
 SELECT f.titulo,
    count(DISTINCT c.idcomentario) AS comentarios,
    count(DISTINCT uf.idusuario) AS miembros
   FROM ((comunidad.foros f
     LEFT JOIN comunidad.comentarios c ON ((f.idforo = c.idforo)))
     LEFT JOIN comunidad.usuario_foro uf ON ((f.idforo = uf.idforo)))
  GROUP BY f.idforo, f.titulo;


ALTER VIEW comunidad.vista_resumen_actividad OWNER TO postgres;

--
-- Name: vista_ranking; Type: VIEW; Schema: gestion; Owner: postgres
--

CREATE VIEW gestion.vista_ranking AS
 SELECT row_number() OVER (ORDER BY puntostotales DESC) AS posicion,
    idusuario,
    nombre,
    apellido,
    fotoperfil,
    puntostotales
   FROM gestion.usuarios u
  WHERE ((estado)::text = 'Activo'::text)
  ORDER BY puntostotales DESC;


ALTER VIEW gestion.vista_ranking OWNER TO postgres;

--
-- Name: vista_resumen_ranking; Type: VIEW; Schema: gestion; Owner: postgres
--

CREATE VIEW gestion.vista_resumen_ranking AS
 SELECT idusuario,
    nombre,
    puntostotales,
    gestion.get_nivel_usuario(puntostotales) AS nivel
   FROM gestion.usuarios
  ORDER BY puntostotales DESC;


ALTER VIEW gestion.vista_resumen_ranking OWNER TO postgres;

--
-- Name: vista_auditoria_habitos; Type: VIEW; Schema: seguimiento; Owner: postgres
--

CREATE VIEW seguimiento.vista_auditoria_habitos AS
 SELECT idhabito,
    nombre,
    descripcion,
    fechainicio,
    fechafin,
    estado,
    puntos,
    idusuario,
    idcategoria
   FROM seguimiento.habitos
  WHERE ((fechafin <= (CURRENT_DATE + 3)) AND ((estado)::text = 'Activo'::text));


ALTER VIEW seguimiento.vista_auditoria_habitos OWNER TO postgres;

--
-- Name: vista_dashboard_usuario; Type: VIEW; Schema: seguimiento; Owner: postgres
--

CREATE VIEW seguimiento.vista_dashboard_usuario AS
 SELECT idusuario,
    nombre,
    puntostotales,
    seguimiento.tasa_cumplimiento_30d(idusuario) AS performance_30d
   FROM gestion.usuarios u;


ALTER VIEW seguimiento.vista_dashboard_usuario OWNER TO postgres;

--
-- Name: vista_progreso_semanal; Type: VIEW; Schema: seguimiento; Owner: postgres
--

CREATE VIEW seguimiento.vista_progreso_semanal AS
 SELECT h.nombre,
    count(r.idregistro) AS completados
   FROM (seguimiento.habitos h
     LEFT JOIN seguimiento.registro_habitos r ON ((h.idhabito = r.idhabito)))
  WHERE ((r.fecha >= (CURRENT_DATE - 7)) AND (r.completado = true))
  GROUP BY h.idhabito, h.nombre;


ALTER VIEW seguimiento.vista_progreso_semanal OWNER TO postgres;

--
-- Name: vista_stats_categorias; Type: VIEW; Schema: seguimiento; Owner: postgres
--

CREATE VIEW seguimiento.vista_stats_categorias AS
 SELECT c.nombre,
    count(h.idhabito) AS total
   FROM (seguimiento.categorias_habitos c
     LEFT JOIN seguimiento.habitos h ON ((c.idcategoria = h.idcategoria)))
  GROUP BY c.idcategoria, c.nombre;


ALTER VIEW seguimiento.vista_stats_categorias OWNER TO postgres;

--
-- Name: usuarios trigger_sync_rol_auth; Type: TRIGGER; Schema: gestion; Owner: postgres
--

CREATE TRIGGER trigger_sync_rol_auth AFTER INSERT OR UPDATE OF idrol ON gestion.usuarios FOR EACH ROW EXECUTE FUNCTION gestion.sync_rol_a_auth();


--
-- Name: habitos tr_validar_fechas; Type: TRIGGER; Schema: seguimiento; Owner: postgres
--

CREATE TRIGGER tr_validar_fechas BEFORE INSERT OR UPDATE ON seguimiento.habitos FOR EACH ROW EXECUTE FUNCTION seguimiento.tr_func_validar_fechas();


--
-- Name: registro_habitos trigger_aplicar_puntos; Type: TRIGGER; Schema: seguimiento; Owner: postgres
--

CREATE TRIGGER trigger_aplicar_puntos AFTER INSERT OR UPDATE ON seguimiento.registro_habitos FOR EACH ROW EXECUTE FUNCTION seguimiento.aplicar_puntos_usuario();


--
-- Name: registro_habitos trigger_asignar_puntos; Type: TRIGGER; Schema: seguimiento; Owner: postgres
--

CREATE TRIGGER trigger_asignar_puntos BEFORE INSERT OR UPDATE ON seguimiento.registro_habitos FOR EACH ROW EXECUTE FUNCTION seguimiento.asignar_puntos_ganados();


