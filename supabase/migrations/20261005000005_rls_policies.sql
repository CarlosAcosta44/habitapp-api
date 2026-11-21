/*====================================================
  ROW LEVEL SECURITY (RLS) Y POLÍTICAS
====================================================*/
--
-- Name: habitos_publicados Actualizar conteo de clones; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Actualizar conteo de clones" ON comunidad.habitos_publicados FOR UPDATE USING (true);


--
-- Name: comentarios Comentarios: Admin puede MODERAR (borrar); Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Comentarios: Admin puede MODERAR (borrar)" ON comunidad.comentarios FOR DELETE USING (gestion.es_admin());


--
-- Name: comentarios Comentarios: Autor gestiona su comentario; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Comentarios: Autor gestiona su comentario" ON comunidad.comentarios USING ((auth.uid() = idusuario));


--
-- Name: comentarios Comentarios: Lectura pública; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Comentarios: Lectura pública" ON comunidad.comentarios FOR SELECT USING (true);


--
-- Name: habitos_publicados Eliminar propios hábitos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Eliminar propios hábitos" ON comunidad.habitos_publicados FOR DELETE USING ((auth.uid() = idusuario));


--
-- Name: usuario_foro Foro_User: Acceso implicado/Admin; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Foro_User: Acceso implicado/Admin" ON comunidad.usuario_foro USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: foros Foros/Artic: Gestión Admin; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Foros/Artic: Gestión Admin" ON comunidad.foros USING (gestion.es_admin());


--
-- Name: articulos Foros/Artic: Gestión Admin art; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Foros/Artic: Gestión Admin art" ON comunidad.articulos USING (gestion.es_admin());


--
-- Name: foros Foros/Artic: Lectura pública; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Foros/Artic: Lectura pública" ON comunidad.foros FOR SELECT USING (true);


--
-- Name: articulos Foros/Artic: Lectura pública art; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Foros/Artic: Lectura pública art" ON comunidad.articulos FOR SELECT USING (true);


--
-- Name: habitos_publicados Insertar hábitos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Insertar hábitos" ON comunidad.habitos_publicados FOR INSERT WITH CHECK ((auth.uid() = idusuario));


--
-- Name: habitos_publicados Lectura pública de hábitos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Lectura pública de hábitos" ON comunidad.habitos_publicados FOR SELECT USING (true);


--
-- Name: habitos_publicados Modificar propios hábitos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Modificar propios hábitos" ON comunidad.habitos_publicados FOR UPDATE USING ((auth.uid() = idusuario));


--
-- Name: quotes Permitir lectura de frases a todos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Permitir lectura de frases a todos" ON comunidad.quotes FOR SELECT USING (true);


--
-- Name: habitos_publicados Publicados visibles para todos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Publicados visibles para todos" ON comunidad.habitos_publicados FOR SELECT USING (true);


--
-- Name: reacciones Reacciones: Dueño gestiona reacción; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Reacciones: Dueño gestiona reacción" ON comunidad.reacciones USING ((auth.uid() = idusuario));


--
-- Name: reacciones Reacciones: Lectura pública; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Reacciones: Lectura pública" ON comunidad.reacciones FOR SELECT USING (true);


--
-- Name: reto_tareas Reto Tareas: lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Reto Tareas: lectura publica" ON comunidad.reto_tareas FOR SELECT USING (true);


--
-- Name: reto_tareas RetoTareas: Admin gestiona; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "RetoTareas: Admin gestiona" ON comunidad.reto_tareas USING (gestion.es_admin());


--
-- Name: reto_tareas RetoTareas: Lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "RetoTareas: Lectura publica" ON comunidad.reto_tareas FOR SELECT USING (true);


--
-- Name: retos Retos: Admin gestiona; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Retos: Admin gestiona" ON comunidad.retos USING (gestion.es_admin());


--
-- Name: retos Retos: Lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Retos: Lectura publica" ON comunidad.retos FOR SELECT USING (true);


--
-- Name: retos Retos: lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Retos: lectura publica" ON comunidad.retos FOR SELECT USING (true);


--
-- Name: usuario_tarea_progreso TareaProgreso: Dueño actualiza; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "TareaProgreso: Dueño actualiza" ON comunidad.usuario_tarea_progreso FOR UPDATE USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_tarea_progreso TareaProgreso: Dueño o admin elimina; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "TareaProgreso: Dueño o admin elimina" ON comunidad.usuario_tarea_progreso FOR DELETE USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_tarea_progreso TareaProgreso: Dueño registra progreso; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "TareaProgreso: Dueño registra progreso" ON comunidad.usuario_tarea_progreso FOR INSERT WITH CHECK (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_tarea_progreso TareaProgreso: Dueño ve su progreso; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "TareaProgreso: Dueño ve su progreso" ON comunidad.usuario_tarea_progreso FOR SELECT USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_reto Usuario Reto: lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Usuario Reto: lectura publica" ON comunidad.usuario_reto FOR SELECT USING (true);


--
-- Name: usuario_tarea_progreso Usuario Tarea Progreso: lectura publica; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Usuario Tarea Progreso: lectura publica" ON comunidad.usuario_tarea_progreso FOR SELECT USING (true);


--
-- Name: usuario_tarea_progreso Usuario Tarea Progreso: propios dueños; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Usuario Tarea Progreso: propios dueños" ON comunidad.usuario_tarea_progreso USING ((auth.uid() = idusuario));


--
-- Name: usuario_reto UsuarioReto: Dueño actualiza; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "UsuarioReto: Dueño actualiza" ON comunidad.usuario_reto FOR UPDATE USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_reto UsuarioReto: Dueño o admin elimina; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "UsuarioReto: Dueño o admin elimina" ON comunidad.usuario_reto FOR DELETE USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_reto UsuarioReto: Dueño se inscribe; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "UsuarioReto: Dueño se inscribe" ON comunidad.usuario_reto FOR INSERT WITH CHECK (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_reto UsuarioReto: Dueño ve su participacion; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "UsuarioReto: Dueño ve su participacion" ON comunidad.usuario_reto FOR SELECT USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: habitos_publicados Usuarios pueden publicar sus propios hábitos; Type: POLICY; Schema: comunidad; Owner: postgres
--

CREATE POLICY "Usuarios pueden publicar sus propios hábitos" ON comunidad.habitos_publicados FOR INSERT WITH CHECK ((auth.uid() = idusuario));


--
-- Name: habitos_publicados; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.habitos_publicados ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: reto_tareas; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.reto_tareas ENABLE ROW LEVEL SECURITY;

--
-- Name: retos; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.retos ENABLE ROW LEVEL SECURITY;

--
-- Name: usuario_foro; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.usuario_foro ENABLE ROW LEVEL SECURITY;

--
-- Name: usuario_reto; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.usuario_reto ENABLE ROW LEVEL SECURITY;

--
-- Name: usuario_tarea_progreso; Type: ROW SECURITY; Schema: comunidad; Owner: postgres
--

ALTER TABLE comunidad.usuario_tarea_progreso ENABLE ROW LEVEL SECURITY;

--
-- Name: administradores Admins: Solo Admin gestiona admins; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Admins: Solo Admin gestiona admins" ON gestion.administradores USING (gestion.es_admin());


--
-- Name: amigos Amigos: Participantes actualizan estado; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amigos: Participantes actualizan estado" ON gestion.amigos FOR UPDATE USING (((auth.uid() = idusuario_solicitante) OR (auth.uid() = idusuario_receptor) OR gestion.es_admin()));


--
-- Name: amigos Amigos: Participantes o admin eliminan; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amigos: Participantes o admin eliminan" ON gestion.amigos FOR DELETE USING (((auth.uid() = idusuario_solicitante) OR (auth.uid() = idusuario_receptor) OR gestion.es_admin()));


--
-- Name: amigos Amigos: Participantes ven la relacion; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amigos: Participantes ven la relacion" ON gestion.amigos FOR SELECT USING (((auth.uid() = idusuario_solicitante) OR (auth.uid() = idusuario_receptor) OR gestion.es_admin()));


--
-- Name: amigos Amigos: Solicitante crea solicitud; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amigos: Solicitante crea solicitud" ON gestion.amigos FOR INSERT WITH CHECK ((auth.uid() = idusuario_solicitante));


--
-- Name: amigos Amistades: lectura permitida; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amistades: lectura permitida" ON gestion.amigos FOR SELECT USING (true);


--
-- Name: amigos Amistades: modificación por dueños; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Amistades: modificación por dueños" ON gestion.amigos USING (((auth.uid() = idusuario_solicitante) OR (auth.uid() = idusuario_receptor)));


--
-- Name: logros Logros: Admin gestiona catalogo; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Logros: Admin gestiona catalogo" ON gestion.logros USING (gestion.es_admin());


--
-- Name: logros Logros: Lectura publica; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Logros: Lectura publica" ON gestion.logros FOR SELECT USING (true);


--
-- Name: logros Logros: lectura publica total; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Logros: lectura publica total" ON gestion.logros FOR SELECT USING (true);


--
-- Name: notificaciones Notif: Admin gestiona todo; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Notif: Admin gestiona todo" ON gestion.notificaciones USING (gestion.es_admin());


--
-- Name: notificaciones Notif: Dueño gestiona sus notif; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Notif: Dueño gestiona sus notif" ON gestion.notificaciones USING ((auth.uid() = idusuario));


--
-- Name: historial_puntos Puntos: Admin gestiona todo; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Puntos: Admin gestiona todo" ON gestion.historial_puntos USING (gestion.es_admin());


--
-- Name: historial_puntos Puntos: Dueño ve sus puntos; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Puntos: Dueño ve sus puntos" ON gestion.historial_puntos FOR SELECT USING ((auth.uid() = idusuario));


--
-- Name: roles Roles: Gestión total Admin; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Roles: Gestión total Admin" ON gestion.roles USING (gestion.es_admin());


--
-- Name: roles Roles: Lectura pública; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Roles: Lectura pública" ON gestion.roles FOR SELECT USING (true);


--
-- Name: usuario_logro Usuario Logros: lectura publica; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Usuario Logros: lectura publica" ON gestion.usuario_logro FOR SELECT USING (true);


--
-- Name: usuario_logro UsuarioLogro: Admin elimina; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "UsuarioLogro: Admin elimina" ON gestion.usuario_logro FOR DELETE USING (gestion.es_admin());


--
-- Name: usuario_logro UsuarioLogro: Admin gestiona; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "UsuarioLogro: Admin gestiona" ON gestion.usuario_logro FOR UPDATE USING (gestion.es_admin());


--
-- Name: usuario_logro UsuarioLogro: Dueño ve sus logros; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "UsuarioLogro: Dueño ve sus logros" ON gestion.usuario_logro FOR SELECT USING (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuario_logro UsuarioLogro: Sistema y admin insertan; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "UsuarioLogro: Sistema y admin insertan" ON gestion.usuario_logro FOR INSERT WITH CHECK (((auth.uid() = idusuario) OR gestion.es_admin()));


--
-- Name: usuarios Usuarios: Admin gestiona todo; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Usuarios: Admin gestiona todo" ON gestion.usuarios USING (gestion.es_admin());


--
-- Name: usuarios Usuarios: Dueño gestiona su perfil; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Usuarios: Dueño gestiona su perfil" ON gestion.usuarios USING ((auth.uid() = idusuario));


--
-- Name: usuarios Usuarios: Entrenador ve a sus pupilos; Type: POLICY; Schema: gestion; Owner: postgres
--

CREATE POLICY "Usuarios: Entrenador ve a sus pupilos" ON gestion.usuarios FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));


--
-- Name: administradores; Type: ROW SECURITY; Schema: gestion; Owner: postgres
--

ALTER TABLE gestion.administradores ENABLE ROW LEVEL SECURITY;

--
-- Name: historial_puntos; Type: ROW SECURITY; Schema: gestion; Owner: postgres
--

ALTER TABLE gestion.historial_puntos ENABLE ROW LEVEL SECURITY;

--
-- Name: categorias_habitos Categorias: Gestión Admin; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Categorias: Gestión Admin" ON seguimiento.categorias_habitos USING (gestion.es_admin());


--
-- Name: categorias_habitos Categorias: Lectura pública; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Categorias: Lectura pública" ON seguimiento.categorias_habitos FOR SELECT USING (true);


--
-- Name: entrenadores Entrenadores: Gestión Admin; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Entrenadores: Gestión Admin" ON seguimiento.entrenadores USING (gestion.es_admin());


--
-- Name: entrenadores Entrenadores: Lectura pública; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Entrenadores: Lectura pública" ON seguimiento.entrenadores FOR SELECT USING (true);


--
-- Name: habitos Habitos: Admin gestiona todo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Habitos: Admin gestiona todo" ON seguimiento.habitos USING (gestion.es_admin());


--
-- Name: habitos Habitos: Dueño gestiona sus habitos; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Habitos: Dueño gestiona sus habitos" ON seguimiento.habitos USING ((auth.uid() = idusuario));


--
-- Name: habitos Habitos: Entrenador ve habitos de pupilo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Habitos: Entrenador ve habitos de pupilo" ON seguimiento.habitos FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));


--
-- Name: recordatorios Recordatorios: Acceso dueño; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Recordatorios: Acceso dueño" ON seguimiento.recordatorios USING ((EXISTS ( SELECT 1
   FROM seguimiento.habitos h
  WHERE ((h.idhabito = recordatorios.idhabito) AND (h.idusuario = auth.uid())))));


--
-- Name: registro_habitos Registros: Admin gestiona todo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Registros: Admin gestiona todo" ON seguimiento.registro_habitos USING (gestion.es_admin());


--
-- Name: registro_habitos Registros: Dueño gestiona; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Registros: Dueño gestiona" ON seguimiento.registro_habitos USING ((auth.uid() = idusuario));


--
-- Name: registro_habitos Registros: Entrenador ve registros de pupilo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Registros: Entrenador ve registros de pupilo" ON seguimiento.registro_habitos FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));


--
-- Name: usuario_entrenador Relacion: Acceso partes implicadas; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Relacion: Acceso partes implicadas" ON seguimiento.usuario_entrenador USING (((auth.uid() = idusuario) OR (EXISTS ( SELECT 1
   FROM seguimiento.entrenadores e
  WHERE ((e.identrenador = usuario_entrenador.identrenador) AND (e.idusuario = auth.uid())))) OR gestion.es_admin()));


--
-- Name: rutinas Rutinas: Admin gestiona todo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Rutinas: Admin gestiona todo" ON seguimiento.rutinas USING (gestion.es_admin());


--
-- Name: rutinas Rutinas: Entrenador gestiona sus rutinas; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Rutinas: Entrenador gestiona sus rutinas" ON seguimiento.rutinas USING ((EXISTS ( SELECT 1
   FROM seguimiento.entrenadores e
  WHERE ((e.identrenador = rutinas.identrenador) AND (e.idusuario = auth.uid())))));


--
-- Name: rutinas Rutinas: Usuario ve su rutina; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Rutinas: Usuario ve su rutina" ON seguimiento.rutinas FOR SELECT USING ((EXISTS ( SELECT 1
   FROM seguimiento.usuario_rutina ur
  WHERE ((ur.idrutina = rutinas.idrutina) AND (ur.idusuario = auth.uid())))));


--
-- Name: perfil_salud Salud: Admin gestiona; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Salud: Admin gestiona" ON seguimiento.perfil_salud USING (gestion.es_admin());


--
-- Name: perfil_salud Salud: Dueño gestiona; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Salud: Dueño gestiona" ON seguimiento.perfil_salud USING ((auth.uid() = idusuario));


--
-- Name: perfil_salud Salud: Entrenador ve salud de pupilo; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Salud: Entrenador ve salud de pupilo" ON seguimiento.perfil_salud FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));


--
-- Name: seguimientos Seguimientos: Entrenador autor actualiza; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Seguimientos: Entrenador autor actualiza" ON seguimiento.seguimientos FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM seguimiento.entrenadores e
  WHERE ((e.identrenador = seguimientos.identrenador) AND (e.idusuario = auth.uid())))) OR gestion.es_admin()));


--
-- Name: seguimientos Seguimientos: Entrenador autor o admin elimina; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Seguimientos: Entrenador autor o admin elimina" ON seguimiento.seguimientos FOR DELETE USING (((EXISTS ( SELECT 1
   FROM seguimiento.entrenadores e
  WHERE ((e.identrenador = seguimientos.identrenador) AND (e.idusuario = auth.uid())))) OR gestion.es_admin()));


--
-- Name: seguimientos Seguimientos: Entrenador crea seguimiento; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Seguimientos: Entrenador crea seguimiento" ON seguimiento.seguimientos FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM seguimiento.entrenadores e
  WHERE ((e.identrenador = seguimientos.identrenador) AND (e.idusuario = auth.uid())))) OR gestion.es_admin()));


--
-- Name: seguimientos Seguimientos: Usuario ve sus reportes; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "Seguimientos: Usuario ve sus reportes" ON seguimiento.seguimientos FOR SELECT USING (((auth.uid() = idusuario) OR seguimiento.es_entrenador_de(idusuario) OR gestion.es_admin()));


--
-- Name: usuario_rutina UsuarioRutina: Admin elimina asignacion; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "UsuarioRutina: Admin elimina asignacion" ON seguimiento.usuario_rutina FOR DELETE USING (gestion.es_admin());


--
-- Name: usuario_rutina UsuarioRutina: Entrenador asigna rutina; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "UsuarioRutina: Entrenador asigna rutina" ON seguimiento.usuario_rutina FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM (seguimiento.rutinas r
     JOIN seguimiento.entrenadores e ON ((e.identrenador = r.identrenador)))
  WHERE ((r.idrutina = usuario_rutina.idrutina) AND (e.idusuario = auth.uid())))) OR gestion.es_admin()));


--
-- Name: usuario_rutina UsuarioRutina: Usuario o entrenador actualiza; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "UsuarioRutina: Usuario o entrenador actualiza" ON seguimiento.usuario_rutina FOR UPDATE USING (((auth.uid() = idusuario) OR seguimiento.es_entrenador_de(idusuario) OR gestion.es_admin()));


--
-- Name: usuario_rutina UsuarioRutina: Usuario ve sus rutinas; Type: POLICY; Schema: seguimiento; Owner: postgres
--

CREATE POLICY "UsuarioRutina: Usuario ve sus rutinas" ON seguimiento.usuario_rutina FOR SELECT USING (((auth.uid() = idusuario) OR seguimiento.es_entrenador_de(idusuario) OR gestion.es_admin()));


--
-- Name: perfil_salud; Type: ROW SECURITY; Schema: seguimiento; Owner: postgres
--

ALTER TABLE seguimiento.perfil_salud ENABLE ROW LEVEL SECURITY;

--
-- Name: seguimientos; Type: ROW SECURITY; Schema: seguimiento; Owner: postgres
--

ALTER TABLE seguimiento.seguimientos ENABLE ROW LEVEL SECURITY;

ALTER TABLE gestion.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Remediación DEF-005 (CP-INT-080): Habilitación de RLS y bloqueo de acceso directo anon en gestion.usuarios y seguimiento.*
ALTER TABLE gestion.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.registro_habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.rutinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.usuario_entrenador ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.usuario_rutina ENABLE ROW LEVEL SECURITY;
