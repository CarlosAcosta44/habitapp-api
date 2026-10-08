/*====================================================
  RESTRICCIONES Y CLAVES FORÁNEAS
====================================================*/
--
-- Name: administrador_articulo administrador_articulo_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.administrador_articulo
    ADD CONSTRAINT administrador_articulo_pkey PRIMARY KEY (idadministrador, idarticulo);


--
-- Name: articulos articulos_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.articulos
    ADD CONSTRAINT articulos_pkey PRIMARY KEY (idarticulo);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (idcomentario);


--
-- Name: foro_administrador foro_administrador_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.foro_administrador
    ADD CONSTRAINT foro_administrador_pkey PRIMARY KEY (idforo, idadministrador);


--
-- Name: foros foros_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.foros
    ADD CONSTRAINT foros_pkey PRIMARY KEY (idforo);


--
-- Name: habitos_publicados habitos_publicados_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.habitos_publicados
    ADD CONSTRAINT habitos_publicados_pkey PRIMARY KEY (idpublicacion);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: reacciones reacciones_idusuario_idarticulo_key; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_idusuario_idarticulo_key UNIQUE (idusuario, idarticulo);


--
-- Name: reacciones reacciones_idusuario_idcomentario_key; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_idusuario_idcomentario_key UNIQUE (idusuario, idcomentario);


--
-- Name: reacciones reacciones_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_pkey PRIMARY KEY (idreaccion);


--
-- Name: reto_tareas reto_tareas_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reto_tareas
    ADD CONSTRAINT reto_tareas_pkey PRIMARY KEY (idtarea);


--
-- Name: retos retos_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.retos
    ADD CONSTRAINT retos_pkey PRIMARY KEY (idreto);


--
-- Name: usuario_foro usuario_foro_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_foro
    ADD CONSTRAINT usuario_foro_pkey PRIMARY KEY (idusuario, idforo);


--
-- Name: usuario_reto usuario_reto_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_reto
    ADD CONSTRAINT usuario_reto_pkey PRIMARY KEY (idusuario, idreto);


--
-- Name: usuario_tarea_progreso usuario_tarea_progreso_pkey; Type: CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_tarea_progreso
    ADD CONSTRAINT usuario_tarea_progreso_pkey PRIMARY KEY (idusuario, idtarea);


--
-- Name: administradores administradores_idusuario_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.administradores
    ADD CONSTRAINT administradores_idusuario_key UNIQUE (idusuario);


--
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (idadministrador);


--
-- Name: amigos amigos_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.amigos
    ADD CONSTRAINT amigos_pkey PRIMARY KEY (idamistad);


--
-- Name: historial_puntos historial_puntos_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.historial_puntos
    ADD CONSTRAINT historial_puntos_pkey PRIMARY KEY (idhistorial);


--
-- Name: identidades identidades_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.identidades
    ADD CONSTRAINT identidades_pkey PRIMARY KEY (id);


--
-- Name: identidades identidades_provider_provider_id_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.identidades
    ADD CONSTRAINT identidades_provider_provider_id_key UNIQUE (provider, provider_id);


--
-- Name: logros logros_nombre_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.logros
    ADD CONSTRAINT logros_nombre_key UNIQUE (nombre);


--
-- Name: logros logros_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.logros
    ADD CONSTRAINT logros_pkey PRIMARY KEY (idlogro);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (idnotificacion);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (idrol);


--
-- Name: roles uq_roles_nombrerol; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.roles
    ADD CONSTRAINT uq_roles_nombrerol UNIQUE (nombrerol);


--
-- Name: usuario_logro usuario_logro_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuario_logro
    ADD CONSTRAINT usuario_logro_pkey PRIMARY KEY (idusuario, idlogro);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (idusuario);


--
-- Name: verificacion_tokens verificacion_tokens_pkey; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.verificacion_tokens
    ADD CONSTRAINT verificacion_tokens_pkey PRIMARY KEY (id);


--
-- Name: verificacion_tokens verificacion_tokens_token_hash_key; Type: CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.verificacion_tokens
    ADD CONSTRAINT verificacion_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: categorias_habitos categorias_habitos_nombre_key; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.categorias_habitos
    ADD CONSTRAINT categorias_habitos_nombre_key UNIQUE (nombre);


--
-- Name: categorias_habitos categorias_habitos_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.categorias_habitos
    ADD CONSTRAINT categorias_habitos_pkey PRIMARY KEY (idcategoria);


--
-- Name: entrenadores entrenadores_idusuario_key; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.entrenadores
    ADD CONSTRAINT entrenadores_idusuario_key UNIQUE (idusuario);


--
-- Name: entrenadores entrenadores_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.entrenadores
    ADD CONSTRAINT entrenadores_pkey PRIMARY KEY (identrenador);


--
-- Name: habitos habitos_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.habitos
    ADD CONSTRAINT habitos_pkey PRIMARY KEY (idhabito);


--
-- Name: perfil_salud perfil_salud_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.perfil_salud
    ADD CONSTRAINT perfil_salud_pkey PRIMARY KEY (idperfil);


--
-- Name: recordatorios recordatorios_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.recordatorios
    ADD CONSTRAINT recordatorios_pkey PRIMARY KEY (idrecordatorio);


--
-- Name: registro_habitos registro_habitos_idhabito_idusuario_fecha_key; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.registro_habitos
    ADD CONSTRAINT registro_habitos_idhabito_idusuario_fecha_key UNIQUE (idhabito, idusuario, fecha);


--
-- Name: registro_habitos registro_habitos_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.registro_habitos
    ADD CONSTRAINT registro_habitos_pkey PRIMARY KEY (idregistro);


--
-- Name: rutinas rutinas_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.rutinas
    ADD CONSTRAINT rutinas_pkey PRIMARY KEY (idrutina);


--
-- Name: seguimientos seguimientos_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.seguimientos
    ADD CONSTRAINT seguimientos_pkey PRIMARY KEY (idseguimiento);


--
-- Name: usuario_entrenador usuario_entrenador_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_entrenador
    ADD CONSTRAINT usuario_entrenador_pkey PRIMARY KEY (idusuario, identrenador);


--
-- Name: usuario_rutina usuario_rutina_pkey; Type: CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_rutina
    ADD CONSTRAINT usuario_rutina_pkey PRIMARY KEY (idusuario, idrutina);


--
-- Name: administrador_articulo administrador_articulo_idadministrador_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.administrador_articulo
    ADD CONSTRAINT administrador_articulo_idadministrador_fkey FOREIGN KEY (idadministrador) REFERENCES gestion.administradores(idadministrador);


--
-- Name: administrador_articulo administrador_articulo_idarticulo_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.administrador_articulo
    ADD CONSTRAINT administrador_articulo_idarticulo_fkey FOREIGN KEY (idarticulo) REFERENCES comunidad.articulos(idarticulo);


--
-- Name: comentarios comentarios_idcomentario_padre_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.comentarios
    ADD CONSTRAINT comentarios_idcomentario_padre_fkey FOREIGN KEY (idcomentario_padre) REFERENCES comunidad.comentarios(idcomentario);


--
-- Name: comentarios comentarios_idforo_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.comentarios
    ADD CONSTRAINT comentarios_idforo_fkey FOREIGN KEY (idforo) REFERENCES comunidad.foros(idforo);


--
-- Name: comentarios comentarios_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.comentarios
    ADD CONSTRAINT comentarios_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: foro_administrador foro_administrador_idadministrador_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.foro_administrador
    ADD CONSTRAINT foro_administrador_idadministrador_fkey FOREIGN KEY (idadministrador) REFERENCES gestion.administradores(idadministrador);


--
-- Name: foro_administrador foro_administrador_idforo_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.foro_administrador
    ADD CONSTRAINT foro_administrador_idforo_fkey FOREIGN KEY (idforo) REFERENCES comunidad.foros(idforo);


--
-- Name: foros foros_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.foros
    ADD CONSTRAINT foros_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: habitos_publicados habitos_publicados_idcategoria_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.habitos_publicados
    ADD CONSTRAINT habitos_publicados_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES seguimiento.categorias_habitos(idcategoria);


--
-- Name: habitos_publicados habitos_publicados_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.habitos_publicados
    ADD CONSTRAINT habitos_publicados_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: reacciones reacciones_idarticulo_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_idarticulo_fkey FOREIGN KEY (idarticulo) REFERENCES comunidad.articulos(idarticulo);


--
-- Name: reacciones reacciones_idcomentario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_idcomentario_fkey FOREIGN KEY (idcomentario) REFERENCES comunidad.comentarios(idcomentario);


--
-- Name: reacciones reacciones_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reacciones
    ADD CONSTRAINT reacciones_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: reto_tareas reto_tareas_idreto_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.reto_tareas
    ADD CONSTRAINT reto_tareas_idreto_fkey FOREIGN KEY (idreto) REFERENCES comunidad.retos(idreto) ON DELETE CASCADE;


--
-- Name: retos retos_idusuario_creador_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.retos
    ADD CONSTRAINT retos_idusuario_creador_fkey FOREIGN KEY (idusuario_creador) REFERENCES gestion.usuarios(idusuario);


--
-- Name: retos retos_insignia_recompensa_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.retos
    ADD CONSTRAINT retos_insignia_recompensa_fkey FOREIGN KEY (insignia_recompensa) REFERENCES gestion.logros(idlogro) ON DELETE SET NULL;


--
-- Name: usuario_foro usuario_foro_idforo_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_foro
    ADD CONSTRAINT usuario_foro_idforo_fkey FOREIGN KEY (idforo) REFERENCES comunidad.foros(idforo);


--
-- Name: usuario_foro usuario_foro_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_foro
    ADD CONSTRAINT usuario_foro_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: usuario_reto usuario_reto_idreto_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_reto
    ADD CONSTRAINT usuario_reto_idreto_fkey FOREIGN KEY (idreto) REFERENCES comunidad.retos(idreto) ON DELETE CASCADE;


--
-- Name: usuario_reto usuario_reto_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_reto
    ADD CONSTRAINT usuario_reto_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: usuario_tarea_progreso usuario_tarea_progreso_idtarea_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_tarea_progreso
    ADD CONSTRAINT usuario_tarea_progreso_idtarea_fkey FOREIGN KEY (idtarea) REFERENCES comunidad.reto_tareas(idtarea) ON DELETE CASCADE;


--
-- Name: usuario_tarea_progreso usuario_tarea_progreso_idusuario_fkey; Type: FK CONSTRAINT; Schema: comunidad; Owner: postgres
--

ALTER TABLE ONLY comunidad.usuario_tarea_progreso
    ADD CONSTRAINT usuario_tarea_progreso_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: administradores administradores_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.administradores
    ADD CONSTRAINT administradores_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: amigos amigos_idusuario_receptor_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.amigos
    ADD CONSTRAINT amigos_idusuario_receptor_fkey FOREIGN KEY (idusuario_receptor) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: amigos amigos_idusuario_solicitante_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.amigos
    ADD CONSTRAINT amigos_idusuario_solicitante_fkey FOREIGN KEY (idusuario_solicitante) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: historial_puntos historial_puntos_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.historial_puntos
    ADD CONSTRAINT historial_puntos_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: identidades identidades_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.identidades
    ADD CONSTRAINT identidades_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.notificaciones
    ADD CONSTRAINT notificaciones_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: refresh_tokens refresh_tokens_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.refresh_tokens
    ADD CONSTRAINT refresh_tokens_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: usuario_logro usuario_logro_idlogro_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuario_logro
    ADD CONSTRAINT usuario_logro_idlogro_fkey FOREIGN KEY (idlogro) REFERENCES gestion.logros(idlogro) ON DELETE CASCADE;


--
-- Name: usuario_logro usuario_logro_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuario_logro
    ADD CONSTRAINT usuario_logro_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_idrol_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.usuarios
    ADD CONSTRAINT usuarios_idrol_fkey FOREIGN KEY (idrol) REFERENCES gestion.roles(idrol);


--
-- Name: verificacion_tokens verificacion_tokens_idusuario_fkey; Type: FK CONSTRAINT; Schema: gestion; Owner: postgres
--

ALTER TABLE ONLY gestion.verificacion_tokens
    ADD CONSTRAINT verificacion_tokens_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE;


--
-- Name: entrenadores entrenadores_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.entrenadores
    ADD CONSTRAINT entrenadores_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: habitos fk_habitos_categoria; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.habitos
    ADD CONSTRAINT fk_habitos_categoria FOREIGN KEY (idcategoria) REFERENCES seguimiento.categorias_habitos(idcategoria);


--
-- Name: habitos habitos_idcategoria_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.habitos
    ADD CONSTRAINT habitos_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES seguimiento.categorias_habitos(idcategoria);


--
-- Name: habitos habitos_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.habitos
    ADD CONSTRAINT habitos_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: perfil_salud perfil_salud_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.perfil_salud
    ADD CONSTRAINT perfil_salud_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: recordatorios recordatorios_idhabito_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.recordatorios
    ADD CONSTRAINT recordatorios_idhabito_fkey FOREIGN KEY (idhabito) REFERENCES seguimiento.habitos(idhabito);


--
-- Name: registro_habitos registro_habitos_idhabito_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.registro_habitos
    ADD CONSTRAINT registro_habitos_idhabito_fkey FOREIGN KEY (idhabito) REFERENCES seguimiento.habitos(idhabito);


--
-- Name: registro_habitos registro_habitos_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.registro_habitos
    ADD CONSTRAINT registro_habitos_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: rutinas rutinas_identrenador_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.rutinas
    ADD CONSTRAINT rutinas_identrenador_fkey FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador);


--
-- Name: seguimientos seguimientos_identrenador_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.seguimientos
    ADD CONSTRAINT seguimientos_identrenador_fkey FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador);


--
-- Name: seguimientos seguimientos_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.seguimientos
    ADD CONSTRAINT seguimientos_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: usuario_entrenador usuario_entrenador_identrenador_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_entrenador
    ADD CONSTRAINT usuario_entrenador_identrenador_fkey FOREIGN KEY (identrenador) REFERENCES seguimiento.entrenadores(identrenador);


--
-- Name: usuario_entrenador usuario_entrenador_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_entrenador
    ADD CONSTRAINT usuario_entrenador_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


--
-- Name: usuario_rutina usuario_rutina_idrutina_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_rutina
    ADD CONSTRAINT usuario_rutina_idrutina_fkey FOREIGN KEY (idrutina) REFERENCES seguimiento.rutinas(idrutina);


--
-- Name: usuario_rutina usuario_rutina_idusuario_fkey; Type: FK CONSTRAINT; Schema: seguimiento; Owner: postgres
--

ALTER TABLE ONLY seguimiento.usuario_rutina
    ADD CONSTRAINT usuario_rutina_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES gestion.usuarios(idusuario);


