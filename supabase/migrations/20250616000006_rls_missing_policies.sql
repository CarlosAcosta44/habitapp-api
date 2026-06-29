-- ====================================================
-- RLS PENDIENTE — ISSUE-010 / feature/be-supabase-migrations
-- Completa políticas faltantes documentadas en plan-maestro-habitapp.md
-- Tablas: amigos, logros, usuario_logro, retos, reto_tareas,
--         usuario_reto, usuario_tarea_progreso, usuario_rutina, seguimientos
-- ====================================================

/*====================================================
  GESTION: amigos, logros, usuario_logro
====================================================*/

ALTER TABLE gestion.amigos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Amigos: Participantes ven la relacion"
  ON gestion.amigos FOR SELECT
  USING (
    auth.uid() = idusuario_solicitante
    OR auth.uid() = idusuario_receptor
    OR gestion.es_admin()
  );

CREATE POLICY "Amigos: Solicitante crea solicitud"
  ON gestion.amigos FOR INSERT
  WITH CHECK (auth.uid() = idusuario_solicitante);

CREATE POLICY "Amigos: Participantes actualizan estado"
  ON gestion.amigos FOR UPDATE
  USING (
    auth.uid() = idusuario_solicitante
    OR auth.uid() = idusuario_receptor
    OR gestion.es_admin()
  );

CREATE POLICY "Amigos: Participantes o admin eliminan"
  ON gestion.amigos FOR DELETE
  USING (
    auth.uid() = idusuario_solicitante
    OR auth.uid() = idusuario_receptor
    OR gestion.es_admin()
  );

ALTER TABLE gestion.logros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logros: Lectura publica"
  ON gestion.logros FOR SELECT
  USING (true);

CREATE POLICY "Logros: Admin gestiona catalogo"
  ON gestion.logros FOR ALL
  USING (gestion.es_admin());

ALTER TABLE gestion.usuario_logro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UsuarioLogro: Dueño ve sus logros"
  ON gestion.usuario_logro FOR SELECT
  USING (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "UsuarioLogro: Sistema y admin insertan"
  ON gestion.usuario_logro FOR INSERT
  WITH CHECK (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "UsuarioLogro: Admin gestiona"
  ON gestion.usuario_logro FOR UPDATE
  USING (gestion.es_admin());

CREATE POLICY "UsuarioLogro: Admin elimina"
  ON gestion.usuario_logro FOR DELETE
  USING (gestion.es_admin());


/*====================================================
  SEGUIMIENTO: usuario_rutina, seguimientos
====================================================*/

CREATE POLICY "UsuarioRutina: Usuario ve sus rutinas"
  ON seguimiento.usuario_rutina FOR SELECT
  USING (
    auth.uid() = idusuario
    OR seguimiento.es_entrenador_de(idusuario)
    OR gestion.es_admin()
  );

CREATE POLICY "UsuarioRutina: Entrenador asigna rutina"
  ON seguimiento.usuario_rutina FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM seguimiento.rutinas r
      JOIN seguimiento.entrenadores e ON e.identrenador = r.identrenador
      WHERE r.idrutina = usuario_rutina.idrutina
        AND e.idusuario = auth.uid()
    )
    OR gestion.es_admin()
  );

CREATE POLICY "UsuarioRutina: Usuario o entrenador actualiza"
  ON seguimiento.usuario_rutina FOR UPDATE
  USING (
    auth.uid() = idusuario
    OR seguimiento.es_entrenador_de(idusuario)
    OR gestion.es_admin()
  );

CREATE POLICY "UsuarioRutina: Admin elimina asignacion"
  ON seguimiento.usuario_rutina FOR DELETE
  USING (gestion.es_admin());

CREATE POLICY "Seguimientos: Usuario ve sus reportes"
  ON seguimiento.seguimientos FOR SELECT
  USING (
    auth.uid() = idusuario
    OR seguimiento.es_entrenador_de(idusuario)
    OR gestion.es_admin()
  );

CREATE POLICY "Seguimientos: Entrenador crea seguimiento"
  ON seguimiento.seguimientos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM seguimiento.entrenadores e
      WHERE e.identrenador = seguimientos.identrenador
        AND e.idusuario = auth.uid()
    )
    OR gestion.es_admin()
  );

CREATE POLICY "Seguimientos: Entrenador autor actualiza"
  ON seguimiento.seguimientos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM seguimiento.entrenadores e
      WHERE e.identrenador = seguimientos.identrenador
        AND e.idusuario = auth.uid()
    )
    OR gestion.es_admin()
  );

CREATE POLICY "Seguimientos: Entrenador autor o admin elimina"
  ON seguimiento.seguimientos FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM seguimiento.entrenadores e
      WHERE e.identrenador = seguimientos.identrenador
        AND e.idusuario = auth.uid()
    )
    OR gestion.es_admin()
  );


/*====================================================
  COMUNIDAD: retos y progreso
====================================================*/

ALTER TABLE comunidad.retos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Retos: Lectura publica"
  ON comunidad.retos FOR SELECT
  USING (true);

CREATE POLICY "Retos: Admin gestiona"
  ON comunidad.retos FOR ALL
  USING (gestion.es_admin());

ALTER TABLE comunidad.reto_tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RetoTareas: Lectura publica"
  ON comunidad.reto_tareas FOR SELECT
  USING (true);

CREATE POLICY "RetoTareas: Admin gestiona"
  ON comunidad.reto_tareas FOR ALL
  USING (gestion.es_admin());

ALTER TABLE comunidad.usuario_reto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UsuarioReto: Dueño ve su participacion"
  ON comunidad.usuario_reto FOR SELECT
  USING (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "UsuarioReto: Dueño se inscribe"
  ON comunidad.usuario_reto FOR INSERT
  WITH CHECK (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "UsuarioReto: Dueño actualiza"
  ON comunidad.usuario_reto FOR UPDATE
  USING (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "UsuarioReto: Dueño o admin elimina"
  ON comunidad.usuario_reto FOR DELETE
  USING (auth.uid() = idusuario OR gestion.es_admin());

ALTER TABLE comunidad.usuario_tarea_progreso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TareaProgreso: Dueño ve su progreso"
  ON comunidad.usuario_tarea_progreso FOR SELECT
  USING (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "TareaProgreso: Dueño registra progreso"
  ON comunidad.usuario_tarea_progreso FOR INSERT
  WITH CHECK (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "TareaProgreso: Dueño actualiza"
  ON comunidad.usuario_tarea_progreso FOR UPDATE
  USING (auth.uid() = idusuario OR gestion.es_admin());

CREATE POLICY "TareaProgreso: Dueño o admin elimina"
  ON comunidad.usuario_tarea_progreso FOR DELETE
  USING (auth.uid() = idusuario OR gestion.es_admin());


/*====================================================
  REDUCCION DE PERMISOS ANON (ISSUE-010)
  El rol anon no debe mutar datos de aplicacion.
====================================================*/

REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gestion FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA seguimiento FROM anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA comunidad FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA gestion
  REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA seguimiento
  REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA comunidad
  REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;
