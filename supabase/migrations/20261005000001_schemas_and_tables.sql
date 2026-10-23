/*====================================================
  ESQUEMAS Y TABLAS
====================================================*/
--
-- Name: comunidad; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA comunidad;


ALTER SCHEMA comunidad OWNER TO postgres;

--
-- Name: gestion; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA gestion;


ALTER SCHEMA gestion OWNER TO postgres;

--
-- Name: seguimiento; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA seguimiento;


ALTER SCHEMA seguimiento OWNER TO postgres;

--
-- Name: administrador_articulo; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.administrador_articulo (
    idadministrador uuid NOT NULL,
    idarticulo uuid NOT NULL
);


ALTER TABLE comunidad.administrador_articulo OWNER TO postgres;

--
-- Name: articulos; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.articulos (
    idarticulo uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo character varying(100) NOT NULL,
    contenido character varying(5000) NOT NULL,
    categoria character varying(45),
    estado character varying(20) DEFAULT 'Publicado'::character varying NOT NULL,
    fechapublicacion date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT articulos_estado_check CHECK (((estado)::text = ANY ((ARRAY['Borrador'::character varying, 'Publicado'::character varying, 'Archivado'::character varying])::text[]))),
    CONSTRAINT chk_articulos_titulo CHECK ((char_length(btrim((titulo)::text)) > 0))
);


ALTER TABLE comunidad.articulos OWNER TO postgres;

--
-- Name: comentarios; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.comentarios (
    idcomentario uuid DEFAULT gen_random_uuid() NOT NULL,
    contenido character varying(500) NOT NULL,
    fechapublicacion date DEFAULT CURRENT_DATE NOT NULL,
    idcomentario_padre uuid,
    idforo uuid NOT NULL,
    idusuario uuid NOT NULL,
    imagen_url text,
    CONSTRAINT chk_comentarios_contenido CHECK ((char_length(btrim((contenido)::text)) > 0))
);


ALTER TABLE comunidad.comentarios OWNER TO postgres;

--
-- Name: foro_administrador; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.foro_administrador (
    idforo uuid NOT NULL,
    idadministrador uuid NOT NULL
);


ALTER TABLE comunidad.foro_administrador OWNER TO postgres;

--
-- Name: foros; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.foros (
    idforo uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo character varying(45) NOT NULL,
    descripcion character varying(200),
    categoria character varying(45),
    estado character varying(20) DEFAULT 'Abierto'::character varying NOT NULL,
    fechacreacion date DEFAULT CURRENT_DATE NOT NULL,
    idusuario uuid,
    imagen_url text,
    CONSTRAINT chk_foros_titulo CHECK ((char_length(btrim((titulo)::text)) > 0)),
    CONSTRAINT foros_estado_check CHECK (((estado)::text = ANY ((ARRAY['Abierto'::character varying, 'Cerrado'::character varying])::text[])))
);


ALTER TABLE comunidad.foros OWNER TO postgres;

--
-- Name: habitos_publicados; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.habitos_publicados (
    idpublicacion uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    nombre_habito character varying(100) NOT NULL,
    descripcion character varying(250),
    idcategoria uuid,
    meta_diaria integer DEFAULT 1,
    unidad_medida character varying(20),
    dias_semana integer[] DEFAULT '{1,2,3,4,5,6,7}'::integer[],
    likes integer DEFAULT 0,
    fechapublicacion date DEFAULT CURRENT_DATE NOT NULL,
    clones_count integer DEFAULT 0
);


ALTER TABLE comunidad.habitos_publicados OWNER TO postgres;

--
-- Name: quotes; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phrase text NOT NULL,
    author text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE comunidad.quotes OWNER TO postgres;

--
-- Name: reacciones; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.reacciones (
    idreaccion uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo character varying(20) NOT NULL,
    idusuario uuid NOT NULL,
    idcomentario uuid,
    idarticulo uuid,
    CONSTRAINT reacciones_check CHECK ((((idcomentario IS NOT NULL) AND (idarticulo IS NULL)) OR ((idcomentario IS NULL) AND (idarticulo IS NOT NULL)))),
    CONSTRAINT reacciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['Me gusta'::character varying, 'Me motiva'::character varying, 'Util'::character varying])::text[])))
);


ALTER TABLE comunidad.reacciones OWNER TO postgres;

--
-- Name: reto_tareas; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.reto_tareas (
    idtarea uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    metrica_objetivo integer NOT NULL,
    unidad_medida character varying(20) NOT NULL,
    icono character varying(20),
    idreto uuid NOT NULL
);


ALTER TABLE comunidad.reto_tareas OWNER TO postgres;

--
-- Name: retos; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.retos (
    idreto uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion character varying(500) NOT NULL,
    puntos_recompensa integer DEFAULT 50 NOT NULL,
    icono character varying(50) DEFAULT '🏆'::character varying NOT NULL,
    fechainicio date DEFAULT CURRENT_DATE NOT NULL,
    fechafin date,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    idusuario_creador uuid,
    CONSTRAINT retos_estado_check CHECK (((estado)::text = ANY ((ARRAY['Borrador'::character varying, 'Activo'::character varying, 'Finalizado'::character varying])::text[])))
);


ALTER TABLE comunidad.retos OWNER TO postgres;

--
-- Name: usuario_foro; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.usuario_foro (
    idusuario uuid NOT NULL,
    idforo uuid NOT NULL
);


ALTER TABLE comunidad.usuario_foro OWNER TO postgres;

--
-- Name: usuario_reto; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.usuario_reto (
    idusuario uuid NOT NULL,
    idreto uuid NOT NULL,
    fechainscripcion date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(20) DEFAULT 'En Curso'::character varying NOT NULL,
    CONSTRAINT usuario_reto_estado_check CHECK (((estado)::text = ANY ((ARRAY['En Curso'::character varying, 'Completado'::character varying, 'Abandonado'::character varying])::text[])))
);


ALTER TABLE comunidad.usuario_reto OWNER TO postgres;

--
-- Name: usuario_tarea_progreso; Type: TABLE; Schema: comunidad; Owner: postgres
--

CREATE TABLE comunidad.usuario_tarea_progreso (
    idusuario uuid NOT NULL,
    idtarea uuid NOT NULL,
    valor_actual integer DEFAULT 0 NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    ultima_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE comunidad.usuario_tarea_progreso OWNER TO postgres;

--
-- Name: administradores; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.administradores (
    idadministrador uuid DEFAULT gen_random_uuid() NOT NULL,
    estadoadmin character varying(20),
    idusuario uuid NOT NULL,
    CONSTRAINT administradores_estadoadmin_check CHECK (((estadoadmin)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[]))),
    CONSTRAINT chk_administradores_estado CHECK (((estadoadmin)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])))
);


ALTER TABLE gestion.administradores OWNER TO postgres;

--
-- Name: amigos; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.amigos (
    idamistad uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario_solicitante uuid NOT NULL,
    idusuario_receptor uuid NOT NULL,
    estado character varying(20) DEFAULT 'Pendiente'::character varying NOT NULL,
    fechasolicitud date DEFAULT CURRENT_DATE NOT NULL,
    fecharespuesta date,
    CONSTRAINT amigos_check CHECK ((idusuario_solicitante <> idusuario_receptor)),
    CONSTRAINT amigos_estado_check CHECK (((estado)::text = ANY ((ARRAY['Pendiente'::character varying, 'Aceptado'::character varying, 'Rechazado'::character varying, 'Bloqueado'::character varying])::text[])))
);


ALTER TABLE gestion.amigos OWNER TO postgres;

--
-- Name: historial_puntos; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.historial_puntos (
    idhistorial uuid DEFAULT gen_random_uuid() NOT NULL,
    puntos integer NOT NULL,
    motivo character varying(100) NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    idusuario uuid NOT NULL
);


ALTER TABLE gestion.historial_puntos OWNER TO postgres;

--
-- Name: identidades; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.identidades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    provider character varying(30) NOT NULL,
    provider_id character varying(255) NOT NULL,
    provider_email character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT identidades_provider_check CHECK (((provider)::text = ANY ((ARRAY['google'::character varying, 'facebook'::character varying, 'microsoft'::character varying, 'local'::character varying])::text[])))
);


ALTER TABLE gestion.identidades OWNER TO postgres;

--
-- Name: logros; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.logros (
    idlogro uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(300) NOT NULL,
    icono character varying(20) NOT NULL,
    puntos_recompensa integer DEFAULT 0,
    tipo character varying(50) DEFAULT 'General'::character varying
);


ALTER TABLE gestion.logros OWNER TO postgres;

--
-- Name: notificaciones; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.notificaciones (
    idnotificacion uuid DEFAULT gen_random_uuid() NOT NULL,
    mensaje character varying(200) NOT NULL,
    tipo character varying(45),
    leida boolean DEFAULT false NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    idusuario uuid NOT NULL,
    CONSTRAINT notificaciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['Habito'::character varying, 'Comunidad'::character varying, 'Entrenador'::character varying, 'Sistema'::character varying])::text[])))
);


ALTER TABLE gestion.notificaciones OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    family_id uuid DEFAULT gen_random_uuid() NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    revoked_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE gestion.refresh_tokens OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.roles (
    idrol uuid DEFAULT gen_random_uuid() NOT NULL,
    nombrerol character varying(45) NOT NULL,
    descripcion character varying(100),
    CONSTRAINT roles_nombrerol_check CHECK (((nombrerol)::text = ANY ((ARRAY['Usuario'::character varying, 'Entrenador'::character varying, 'Administrador'::character varying])::text[])))
);


ALTER TABLE gestion.roles OWNER TO postgres;

--
-- Name: usuario_logro; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.usuario_logro (
    idusuario uuid NOT NULL,
    idlogro uuid NOT NULL,
    fechaobtenido date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE gestion.usuario_logro OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.usuarios (
    idusuario uuid NOT NULL,
    nombre character varying(45) NOT NULL,
    apellido character varying(45) NOT NULL,
    telefono character varying(20),
    genero character varying(20),
    fechanacimiento date,
    fotoperfil character varying(200),
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    puntostotales integer DEFAULT 0 NOT NULL,
    idrol uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    estado_cuenta character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    fcm_token character varying(255),
    CONSTRAINT chk_usuarios_estado CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying, 'Suspendido'::character varying])::text[]))),
    CONSTRAINT chk_usuarios_genero CHECK (((genero)::text = ANY ((ARRAY['Masculino'::character varying, 'Femenino'::character varying, 'Otro'::character varying])::text[]))),
    CONSTRAINT usuarios_estado_check CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying, 'Suspendido'::character varying])::text[]))),
    CONSTRAINT usuarios_estado_cuenta_check CHECK (((estado_cuenta)::text = ANY ((ARRAY['Pendiente'::character varying, 'Activo'::character varying, 'Suspendido'::character varying])::text[]))),
    CONSTRAINT usuarios_genero_check CHECK (((genero)::text = ANY ((ARRAY['Masculino'::character varying, 'Femenino'::character varying, 'Otro'::character varying])::text[])))
);


ALTER TABLE gestion.usuarios OWNER TO postgres;

--
-- Name: verificacion_tokens; Type: TABLE; Schema: gestion; Owner: postgres
--

CREATE TABLE gestion.verificacion_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    tipo character varying(30) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT verificacion_tokens_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['verificacion_email'::character varying, 'reset_password'::character varying])::text[])))
);


ALTER TABLE gestion.verificacion_tokens OWNER TO postgres;

--
-- Name: categorias_habitos; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.categorias_habitos (
    idcategoria uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(45) NOT NULL,
    descripcion character varying(200),
    icono character varying(50)
);


ALTER TABLE seguimiento.categorias_habitos OWNER TO postgres;

--
-- Name: entrenadores; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.entrenadores (
    identrenador uuid DEFAULT gen_random_uuid() NOT NULL,
    especialidad character varying(45),
    certificacion character varying(100),
    experiencia integer,
    idusuario uuid NOT NULL,
    latitud numeric(10,8),
    longitud numeric(11,8)
);


ALTER TABLE seguimiento.entrenadores OWNER TO postgres;

--
-- Name: habitos; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.habitos (
    idhabito uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(45) NOT NULL,
    descripcion character varying(200),
    fechainicio date DEFAULT CURRENT_DATE NOT NULL,
    fechafin date,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    puntos integer DEFAULT 0 NOT NULL,
    idusuario uuid NOT NULL,
    idcategoria uuid NOT NULL,
    meta_diaria integer DEFAULT 1 NOT NULL,
    unidad_medida character varying(30) DEFAULT 'veces'::character varying NOT NULL,
    dias_semana smallint[] DEFAULT '{1,2,3,4,5,6,7}'::smallint[],
    CONSTRAINT chk_habitos_estado CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying, 'Completado'::character varying, 'Archivado'::character varying, 'Pausado'::character varying])::text[]))),
    CONSTRAINT chk_habitos_puntos CHECK ((puntos >= 0)),
    CONSTRAINT habitos_estado_check CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying, 'Completado'::character varying])::text[])))
);


ALTER TABLE seguimiento.habitos OWNER TO postgres;

--
-- Name: perfil_salud; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.perfil_salud (
    idperfil uuid DEFAULT gen_random_uuid() NOT NULL,
    peso numeric(5,2),
    altura numeric(5,2),
    nivelactividad character varying(20),
    objetivo character varying(100),
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    idusuario uuid NOT NULL,
    CONSTRAINT perfil_salud_nivelactividad_check CHECK (((nivelactividad)::text = ANY ((ARRAY['Sedentario'::character varying, 'Moderado'::character varying, 'Activo'::character varying, 'Muy Activo'::character varying])::text[])))
);


ALTER TABLE seguimiento.perfil_salud OWNER TO postgres;

--
-- Name: recordatorios; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.recordatorios (
    idrecordatorio uuid DEFAULT gen_random_uuid() NOT NULL,
    mensaje character varying(100) NOT NULL,
    hora time without time zone NOT NULL,
    frecuencia character varying(20) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    idhabito uuid NOT NULL,
    CONSTRAINT chk_recordatorios_frecuencia CHECK (((frecuencia)::text = ANY ((ARRAY['Diario'::character varying, 'Semanal'::character varying, 'Mensual'::character varying])::text[]))),
    CONSTRAINT recordatorios_frecuencia_check CHECK (((frecuencia)::text = ANY ((ARRAY['Diario'::character varying, 'Semanal'::character varying, 'Mensual'::character varying])::text[])))
);


ALTER TABLE seguimiento.recordatorios OWNER TO postgres;

--
-- Name: registro_habitos; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.registro_habitos (
    idregistro uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    puntos_ganados integer DEFAULT 0 NOT NULL,
    observacion character varying(200),
    idhabito uuid NOT NULL,
    idusuario uuid NOT NULL,
    progreso_actual integer DEFAULT 0 NOT NULL
);


ALTER TABLE seguimiento.registro_habitos OWNER TO postgres;

--
-- Name: rutinas; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.rutinas (
    idrutina uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo character varying(30) NOT NULL,
    descripcion character varying(500),
    duracion integer,
    objetivo character varying(200),
    nivel character varying(20) NOT NULL,
    identrenador uuid NOT NULL,
    CONSTRAINT chk_rutinas_duracion CHECK ((duracion >= 0)),
    CONSTRAINT chk_rutinas_nivel CHECK (((nivel)::text = ANY ((ARRAY['Principiante'::character varying, 'Intermedio'::character varying, 'Avanzado'::character varying])::text[]))),
    CONSTRAINT rutinas_nivel_check CHECK (((nivel)::text = ANY ((ARRAY['Principiante'::character varying, 'Intermedio'::character varying, 'Avanzado'::character varying])::text[])))
);


ALTER TABLE seguimiento.rutinas OWNER TO postgres;

--
-- Name: seguimientos; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.seguimientos (
    idseguimiento uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    progreso character varying(100),
    observaciones character varying(200),
    identrenador uuid NOT NULL,
    idusuario uuid NOT NULL
);


ALTER TABLE seguimiento.seguimientos OWNER TO postgres;

--
-- Name: usuario_entrenador; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.usuario_entrenador (
    idusuario uuid NOT NULL,
    identrenador uuid NOT NULL,
    fechainicio date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE seguimiento.usuario_entrenador OWNER TO postgres;

--
-- Name: usuario_rutina; Type: TABLE; Schema: seguimiento; Owner: postgres
--

CREATE TABLE seguimiento.usuario_rutina (
    idusuario uuid NOT NULL,
    idrutina uuid NOT NULL,
    fechainicio date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(20) DEFAULT 'Activo'::character varying NOT NULL,
    CONSTRAINT usuario_rutina_estado_check CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Completado'::character varying, 'Abandonado'::character varying])::text[])))
);


ALTER TABLE seguimiento.usuario_rutina OWNER TO postgres;

--
-- Name: SCHEMA comunidad; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA comunidad TO anon;
GRANT USAGE ON SCHEMA comunidad TO authenticated;
GRANT USAGE ON SCHEMA comunidad TO service_role;


--
-- Name: SCHEMA gestion; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA gestion TO anon;
GRANT USAGE ON SCHEMA gestion TO authenticated;
GRANT USAGE ON SCHEMA gestion TO service_role;


--
-- Name: SCHEMA seguimiento; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA seguimiento TO anon;
GRANT USAGE ON SCHEMA seguimiento TO authenticated;
GRANT USAGE ON SCHEMA seguimiento TO service_role;


--
-- Name: FUNCTION foro_esta_abierto(p_idforo uuid); Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT ALL ON FUNCTION comunidad.foro_esta_abierto(p_idforo uuid) TO anon;
GRANT ALL ON FUNCTION comunidad.foro_esta_abierto(p_idforo uuid) TO authenticated;
GRANT ALL ON FUNCTION comunidad.foro_esta_abierto(p_idforo uuid) TO service_role;


--
-- Name: FUNCTION total_reacciones_foro(p_idforo uuid); Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT ALL ON FUNCTION comunidad.total_reacciones_foro(p_idforo uuid) TO anon;
GRANT ALL ON FUNCTION comunidad.total_reacciones_foro(p_idforo uuid) TO authenticated;
GRANT ALL ON FUNCTION comunidad.total_reacciones_foro(p_idforo uuid) TO service_role;


--
-- Name: FUNCTION tr_func_notif_coment(); Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT ALL ON FUNCTION comunidad.tr_func_notif_coment() TO anon;
GRANT ALL ON FUNCTION comunidad.tr_func_notif_coment() TO authenticated;
GRANT ALL ON FUNCTION comunidad.tr_func_notif_coment() TO service_role;


--
-- Name: FUNCTION es_admin(); Type: ACL; Schema: gestion; Owner: postgres
--

GRANT ALL ON FUNCTION gestion.es_admin() TO anon;
GRANT ALL ON FUNCTION gestion.es_admin() TO authenticated;
GRANT ALL ON FUNCTION gestion.es_admin() TO service_role;


--
-- Name: FUNCTION get_nivel_usuario(p_puntos integer); Type: ACL; Schema: gestion; Owner: postgres
--

GRANT ALL ON FUNCTION gestion.get_nivel_usuario(p_puntos integer) TO anon;
GRANT ALL ON FUNCTION gestion.get_nivel_usuario(p_puntos integer) TO authenticated;
GRANT ALL ON FUNCTION gestion.get_nivel_usuario(p_puntos integer) TO service_role;


--
-- Name: FUNCTION get_total_usuarios(); Type: ACL; Schema: gestion; Owner: postgres
--

GRANT ALL ON FUNCTION gestion.get_total_usuarios() TO anon;
GRANT ALL ON FUNCTION gestion.get_total_usuarios() TO authenticated;
GRANT ALL ON FUNCTION gestion.get_total_usuarios() TO service_role;


--
-- Name: FUNCTION tr_func_sumar_total(); Type: ACL; Schema: gestion; Owner: postgres
--

GRANT ALL ON FUNCTION gestion.tr_func_sumar_total() TO anon;
GRANT ALL ON FUNCTION gestion.tr_func_sumar_total() TO authenticated;
GRANT ALL ON FUNCTION gestion.tr_func_sumar_total() TO service_role;


--
-- Name: FUNCTION tr_func_touch_interaccion(); Type: ACL; Schema: gestion; Owner: postgres
--

GRANT ALL ON FUNCTION gestion.tr_func_touch_interaccion() TO anon;
GRANT ALL ON FUNCTION gestion.tr_func_touch_interaccion() TO authenticated;
GRANT ALL ON FUNCTION gestion.tr_func_touch_interaccion() TO service_role;


--
-- Name: FUNCTION calcular_racha_actual(p_idhabito uuid); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.calcular_racha_actual(p_idhabito uuid) TO anon;
GRANT ALL ON FUNCTION seguimiento.calcular_racha_actual(p_idhabito uuid) TO authenticated;
GRANT ALL ON FUNCTION seguimiento.calcular_racha_actual(p_idhabito uuid) TO service_role;


--
-- Name: FUNCTION es_entrenador(); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.es_entrenador() TO anon;
GRANT ALL ON FUNCTION seguimiento.es_entrenador() TO authenticated;
GRANT ALL ON FUNCTION seguimiento.es_entrenador() TO service_role;


--
-- Name: FUNCTION es_entrenador_de(p_id_usuario uuid); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.es_entrenador_de(p_id_usuario uuid) TO anon;
GRANT ALL ON FUNCTION seguimiento.es_entrenador_de(p_id_usuario uuid) TO authenticated;
GRANT ALL ON FUNCTION seguimiento.es_entrenador_de(p_id_usuario uuid) TO service_role;


--
-- Name: FUNCTION es_habito_vigente(p_idhabito uuid); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.es_habito_vigente(p_idhabito uuid) TO anon;
GRANT ALL ON FUNCTION seguimiento.es_habito_vigente(p_idhabito uuid) TO authenticated;
GRANT ALL ON FUNCTION seguimiento.es_habito_vigente(p_idhabito uuid) TO service_role;


--
-- Name: FUNCTION get_nombre_entrenador(p_idusuario uuid); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.get_nombre_entrenador(p_idusuario uuid) TO anon;
GRANT ALL ON FUNCTION seguimiento.get_nombre_entrenador(p_idusuario uuid) TO authenticated;
GRANT ALL ON FUNCTION seguimiento.get_nombre_entrenador(p_idusuario uuid) TO service_role;


--
-- Name: FUNCTION tasa_cumplimiento_30d(p_idusuario uuid); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario uuid) TO anon;
GRANT ALL ON FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario uuid) TO authenticated;
GRANT ALL ON FUNCTION seguimiento.tasa_cumplimiento_30d(p_idusuario uuid) TO service_role;


--
-- Name: FUNCTION tr_func_limite_habitos(); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.tr_func_limite_habitos() TO anon;
GRANT ALL ON FUNCTION seguimiento.tr_func_limite_habitos() TO authenticated;
GRANT ALL ON FUNCTION seguimiento.tr_func_limite_habitos() TO service_role;


--
-- Name: FUNCTION tr_func_proteger_cat(); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.tr_func_proteger_cat() TO anon;
GRANT ALL ON FUNCTION seguimiento.tr_func_proteger_cat() TO authenticated;
GRANT ALL ON FUNCTION seguimiento.tr_func_proteger_cat() TO service_role;


--
-- Name: FUNCTION tr_func_validar_fechas(); Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT ALL ON FUNCTION seguimiento.tr_func_validar_fechas() TO anon;
GRANT ALL ON FUNCTION seguimiento.tr_func_validar_fechas() TO authenticated;
GRANT ALL ON FUNCTION seguimiento.tr_func_validar_fechas() TO service_role;


--
-- Name: TABLE administrador_articulo; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.administrador_articulo TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.administrador_articulo TO authenticated;
GRANT ALL ON TABLE comunidad.administrador_articulo TO service_role;


--
-- Name: TABLE articulos; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.articulos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.articulos TO authenticated;
GRANT ALL ON TABLE comunidad.articulos TO service_role;


--
-- Name: TABLE comentarios; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.comentarios TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.comentarios TO authenticated;
GRANT ALL ON TABLE comunidad.comentarios TO service_role;


--
-- Name: TABLE foro_administrador; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.foro_administrador TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.foro_administrador TO authenticated;
GRANT ALL ON TABLE comunidad.foro_administrador TO service_role;


--
-- Name: TABLE foros; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.foros TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.foros TO authenticated;
GRANT ALL ON TABLE comunidad.foros TO service_role;


--
-- Name: TABLE habitos_publicados; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.habitos_publicados TO anon;
GRANT ALL ON TABLE comunidad.habitos_publicados TO authenticated;
GRANT ALL ON TABLE comunidad.habitos_publicados TO service_role;


--
-- Name: TABLE quotes; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.quotes TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.quotes TO authenticated;
GRANT SELECT ON TABLE comunidad.quotes TO service_role;


--
-- Name: TABLE reacciones; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.reacciones TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.reacciones TO authenticated;
GRANT ALL ON TABLE comunidad.reacciones TO service_role;


--
-- Name: TABLE reto_tareas; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.reto_tareas TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.reto_tareas TO authenticated;
GRANT ALL ON TABLE comunidad.reto_tareas TO service_role;


--
-- Name: TABLE retos; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.retos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.retos TO authenticated;
GRANT ALL ON TABLE comunidad.retos TO service_role;


--
-- Name: TABLE usuario_foro; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.usuario_foro TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.usuario_foro TO authenticated;
GRANT ALL ON TABLE comunidad.usuario_foro TO service_role;


--
-- Name: TABLE usuario_reto; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.usuario_reto TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.usuario_reto TO authenticated;
GRANT ALL ON TABLE comunidad.usuario_reto TO service_role;


--
-- Name: TABLE usuario_tarea_progreso; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.usuario_tarea_progreso TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.usuario_tarea_progreso TO authenticated;
GRANT ALL ON TABLE comunidad.usuario_tarea_progreso TO service_role;


--
-- Name: TABLE vista_articulos_trending; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.vista_articulos_trending TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.vista_articulos_trending TO authenticated;
GRANT ALL ON TABLE comunidad.vista_articulos_trending TO service_role;


--
-- Name: TABLE vista_resumen_actividad; Type: ACL; Schema: comunidad; Owner: postgres
--

GRANT SELECT ON TABLE comunidad.vista_resumen_actividad TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE comunidad.vista_resumen_actividad TO authenticated;
GRANT ALL ON TABLE comunidad.vista_resumen_actividad TO service_role;


--
-- Name: TABLE administradores; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.administradores TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.administradores TO authenticated;
GRANT ALL ON TABLE gestion.administradores TO service_role;


--
-- Name: TABLE amigos; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.amigos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.amigos TO authenticated;
GRANT ALL ON TABLE gestion.amigos TO service_role;


--
-- Name: TABLE historial_puntos; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.historial_puntos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.historial_puntos TO authenticated;
GRANT ALL ON TABLE gestion.historial_puntos TO service_role;


--
-- Name: TABLE identidades; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.identidades TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.identidades TO authenticated;


--
-- Name: TABLE logros; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.logros TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.logros TO authenticated;
GRANT ALL ON TABLE gestion.logros TO service_role;


--
-- Name: TABLE notificaciones; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.notificaciones TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.notificaciones TO authenticated;
GRANT ALL ON TABLE gestion.notificaciones TO service_role;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.refresh_tokens TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.refresh_tokens TO authenticated;


--
-- Name: TABLE roles; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.roles TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.roles TO authenticated;
GRANT ALL ON TABLE gestion.roles TO service_role;


--
-- Name: TABLE usuario_logro; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.usuario_logro TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.usuario_logro TO authenticated;
GRANT ALL ON TABLE gestion.usuario_logro TO service_role;


--
-- Name: TABLE usuarios; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.usuarios TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.usuarios TO authenticated;
GRANT ALL ON TABLE gestion.usuarios TO service_role;


--
-- Name: TABLE verificacion_tokens; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.verificacion_tokens TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.verificacion_tokens TO authenticated;


--
-- Name: TABLE vista_ranking; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.vista_ranking TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.vista_ranking TO authenticated;
GRANT ALL ON TABLE gestion.vista_ranking TO service_role;


--
-- Name: TABLE vista_resumen_ranking; Type: ACL; Schema: gestion; Owner: postgres
--

GRANT SELECT ON TABLE gestion.vista_resumen_ranking TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE gestion.vista_resumen_ranking TO authenticated;
GRANT ALL ON TABLE gestion.vista_resumen_ranking TO service_role;


--
-- Name: TABLE categorias_habitos; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.categorias_habitos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.categorias_habitos TO authenticated;
GRANT ALL ON TABLE seguimiento.categorias_habitos TO service_role;


--
-- Name: TABLE entrenadores; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.entrenadores TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.entrenadores TO authenticated;
GRANT ALL ON TABLE seguimiento.entrenadores TO service_role;


--
-- Name: TABLE habitos; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.habitos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.habitos TO authenticated;
GRANT ALL ON TABLE seguimiento.habitos TO service_role;


--
-- Name: TABLE perfil_salud; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.perfil_salud TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.perfil_salud TO authenticated;
GRANT ALL ON TABLE seguimiento.perfil_salud TO service_role;


--
-- Name: TABLE recordatorios; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.recordatorios TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.recordatorios TO authenticated;
GRANT ALL ON TABLE seguimiento.recordatorios TO service_role;


--
-- Name: TABLE registro_habitos; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.registro_habitos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.registro_habitos TO authenticated;
GRANT ALL ON TABLE seguimiento.registro_habitos TO service_role;


--
-- Name: TABLE rutinas; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.rutinas TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.rutinas TO authenticated;
GRANT ALL ON TABLE seguimiento.rutinas TO service_role;


--
-- Name: TABLE seguimientos; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.seguimientos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.seguimientos TO authenticated;
GRANT ALL ON TABLE seguimiento.seguimientos TO service_role;


--
-- Name: TABLE usuario_entrenador; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.usuario_entrenador TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.usuario_entrenador TO authenticated;
GRANT ALL ON TABLE seguimiento.usuario_entrenador TO service_role;


--
-- Name: TABLE usuario_rutina; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.usuario_rutina TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.usuario_rutina TO authenticated;
GRANT ALL ON TABLE seguimiento.usuario_rutina TO service_role;


--
-- Name: TABLE vista_auditoria_habitos; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.vista_auditoria_habitos TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.vista_auditoria_habitos TO authenticated;
GRANT ALL ON TABLE seguimiento.vista_auditoria_habitos TO service_role;


--
-- Name: TABLE vista_dashboard_usuario; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.vista_dashboard_usuario TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.vista_dashboard_usuario TO authenticated;
GRANT ALL ON TABLE seguimiento.vista_dashboard_usuario TO service_role;


--
-- Name: TABLE vista_progreso_semanal; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.vista_progreso_semanal TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.vista_progreso_semanal TO authenticated;
GRANT ALL ON TABLE seguimiento.vista_progreso_semanal TO service_role;


--
-- Name: TABLE vista_stats_categorias; Type: ACL; Schema: seguimiento; Owner: postgres
--

GRANT SELECT ON TABLE seguimiento.vista_stats_categorias TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE seguimiento.vista_stats_categorias TO authenticated;
GRANT ALL ON TABLE seguimiento.vista_stats_categorias TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: comunidad; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA comunidad GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA comunidad GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: gestion; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gestion GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA gestion GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: seguimiento; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA seguimiento GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA seguimiento GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO authenticated;


--
-- PostgreSQL database dump complete
--

\unrestrict c2qcWiBN0LgOUI6sINhlixH91Xmd2LaLADcZCM46XfcTaL1SGDnXPDzYb6IJiWU




--
-- Name: refresh_tokens; Type: TABLE; Schema: gestion; Owner: postgres
--
CREATE TABLE gestion.refresh_tokens (
    idtoken uuid DEFAULT gen_random_uuid() NOT NULL,
    idusuario uuid NOT NULL,
    token character varying(255) NOT NULL,
    expiracion timestamp without time zone NOT NULL,
    revocado boolean DEFAULT false,
    fechacreacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (idtoken),
    CONSTRAINT refresh_tokens_token_key UNIQUE (token),
    CONSTRAINT refresh_tokens_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE
);
