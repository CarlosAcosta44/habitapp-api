/*====================================================
  ÍNDICES
====================================================*/
--
-- Name: idx_articulos_fechapublicacion; Type: INDEX; Schema: comunidad; Owner: postgres
--

CREATE INDEX idx_articulos_fechapublicacion ON comunidad.articulos USING btree (fechapublicacion DESC);


--
-- Name: idx_comentarios_foro_fecha; Type: INDEX; Schema: comunidad; Owner: postgres
--

CREATE INDEX idx_comentarios_foro_fecha ON comunidad.comentarios USING btree (idforo, fechapublicacion DESC);


--
-- Name: idx_comentarios_idforo; Type: INDEX; Schema: comunidad; Owner: postgres
--

CREATE INDEX idx_comentarios_idforo ON comunidad.comentarios USING btree (idforo);


--
-- Name: idx_foros_fechacreacion; Type: INDEX; Schema: comunidad; Owner: postgres
--

CREATE INDEX idx_foros_fechacreacion ON comunidad.foros USING btree (fechacreacion DESC);


--
-- Name: idx_administradores_estado; Type: INDEX; Schema: gestion; Owner: postgres
--

CREATE INDEX idx_administradores_estado ON gestion.administradores USING btree (estadoadmin);


--
-- Name: idx_usuarios_estado; Type: INDEX; Schema: gestion; Owner: postgres
--

CREATE INDEX idx_usuarios_estado ON gestion.usuarios USING btree (estado);


--
-- Name: idx_usuarios_idrol; Type: INDEX; Schema: gestion; Owner: postgres
--

CREATE INDEX idx_usuarios_idrol ON gestion.usuarios USING btree (idrol);


--
-- Name: unique_amistad_relacion; Type: INDEX; Schema: gestion; Owner: postgres
--

CREATE UNIQUE INDEX unique_amistad_relacion ON gestion.amigos USING btree (LEAST(idusuario_solicitante, idusuario_receptor), GREATEST(idusuario_solicitante, idusuario_receptor));


--
-- Name: idx_entrenadores_lat_lng; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_entrenadores_lat_lng ON seguimiento.entrenadores USING btree (latitud, longitud);


--
-- Name: idx_habitos_estado; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_habitos_estado ON seguimiento.habitos USING btree (estado);


--
-- Name: idx_habitos_idcategoria; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_habitos_idcategoria ON seguimiento.habitos USING btree (idcategoria);


--
-- Name: idx_habitos_idusuario; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_habitos_idusuario ON seguimiento.habitos USING btree (idusuario);


--
-- Name: idx_habitos_usuario_estado; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_habitos_usuario_estado ON seguimiento.habitos USING btree (idusuario, estado) INCLUDE (nombre, puntos, fechainicio);


--
-- Name: idx_recordatorios_idhabito; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_recordatorios_idhabito ON seguimiento.recordatorios USING btree (idhabito);


--
-- Name: idx_rutinas_identrenador; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_rutinas_identrenador ON seguimiento.rutinas USING btree (identrenador);


--
-- Name: idx_rutinas_tipo; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_rutinas_tipo ON seguimiento.rutinas USING btree (tipo);


--
-- Name: idx_seguimientos_identrenador; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_seguimientos_identrenador ON seguimiento.seguimientos USING btree (identrenador);


--
-- Name: idx_seguimientos_idusuario; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_seguimientos_idusuario ON seguimiento.seguimientos USING btree (idusuario);


--
-- Name: idx_seguimientos_usuario_fecha; Type: INDEX; Schema: seguimiento; Owner: postgres
--

CREATE INDEX idx_seguimientos_usuario_fecha ON seguimiento.seguimientos USING btree (idusuario, fecha DESC) INCLUDE (progreso, observaciones);


