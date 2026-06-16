-- ====================================================
-- CAPA DE SEGURIDAD - ROW LEVEL SECURITY (RLS)
-- HabitApp - Supabase / Postgres
-- Basado en Matriz de Roles: Administrativos, Entrenadores y Usuarios
-- ====================================================

/*====================================================
  1. FUNCIONES AUXILIARES DE SEGURIDAD
  (Definer para evitar recursión infinita en políticas)
====================================================*/

-- Verificar si el usuario es Administrador
CREATE OR REPLACE FUNCTION gestion.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM gestion.administradores 
        WHERE idusuario = auth.uid() AND estadoadmin = 'Activo'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar si el usuario es un Entrenador
CREATE OR REPLACE FUNCTION seguimiento.es_entrenador()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.entrenadores 
        WHERE idusuario = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar si el usuario es el entrenador asignado de un usuario específico
CREATE OR REPLACE FUNCTION seguimiento.es_entrenador_de(p_id_usuario UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM seguimiento.usuario_entrenador ue
        JOIN seguimiento.entrenadores e ON ue.identrenador = e.identrenador
        WHERE ue.idusuario = p_id_usuario 
        AND e.idusuario = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


/*====================================================
  2. ESQUEMA GESTION: CONFIGURACIÓN RLS
====================================================*/

-- Tabla: roles (Lectura pública, Gestión Admin)
ALTER TABLE gestion.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles: Lectura pública" ON gestion.roles FOR SELECT USING (true);
CREATE POLICY "Roles: Gestión total Admin" ON gestion.roles FOR ALL USING (gestion.es_admin());

-- Tabla: usuarios (Dueño, Admin, y Entrenador asignado puede ver)
ALTER TABLE gestion.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios: Dueño gestiona su perfil" ON gestion.usuarios FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Usuarios: Admin gestiona todo" ON gestion.usuarios FOR ALL USING (gestion.es_admin());
CREATE POLICY "Usuarios: Entrenador ve a sus pupilos" ON gestion.usuarios FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));

-- Tabla: administradores (Solo Admin gestiona y ve)
ALTER TABLE gestion.administradores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins: Solo Admin gestiona admins" ON gestion.administradores FOR ALL USING (gestion.es_admin());

-- Tabla: historial_puntos (Dueño ve, Admin gestiona)
ALTER TABLE gestion.historial_puntos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puntos: Dueño ve sus puntos" ON gestion.historial_puntos FOR SELECT USING (auth.uid() = idusuario);
CREATE POLICY "Puntos: Admin gestiona todo" ON gestion.historial_puntos FOR ALL USING (gestion.es_admin());

-- Tabla: notificaciones (Dueño gestiona, Admin puede crear/gestionar)
ALTER TABLE gestion.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notif: Dueño gestiona sus notif" ON gestion.notificaciones FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Notif: Admin gestiona todo" ON gestion.notificaciones FOR ALL USING (gestion.es_admin());


/*====================================================
  3. ESQUEMA SEGUIMIENTO: CONFIGURACIÓN RLS
====================================================*/

-- Tabla: categorias_habitos (Lectura pública, Gestión Admin)
ALTER TABLE seguimiento.categorias_habitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias: Lectura pública" ON seguimiento.categorias_habitos FOR SELECT USING (true);
CREATE POLICY "Categorias: Gestión Admin" ON seguimiento.categorias_habitos FOR ALL USING (gestion.es_admin());

-- Tabla: habitos (Dueño gestiona, Entrenador ve, Admin gestiona)
ALTER TABLE seguimiento.habitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Habitos: Dueño gestiona sus habitos" ON seguimiento.habitos FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Habitos: Entrenador ve habitos de pupilo" ON seguimiento.habitos FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));
CREATE POLICY "Habitos: Admin gestiona todo" ON seguimiento.habitos FOR ALL USING (gestion.es_admin());

-- Tabla: registro_habitos (Dueño gestiona, Entrenador ve, Admin gestiona)
ALTER TABLE seguimiento.registro_habitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registros: Dueño gestiona" ON seguimiento.registro_habitos FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Registros: Entrenador ve registros de pupilo" ON seguimiento.registro_habitos FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));
CREATE POLICY "Registros: Admin gestiona todo" ON seguimiento.registro_habitos FOR ALL USING (gestion.es_admin());

-- Tabla: recordatorios (Solo dueño gestiona)
ALTER TABLE seguimiento.recordatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recordatorios: Acceso dueño" ON seguimiento.recordatorios FOR ALL 
USING (EXISTS (SELECT 1 FROM seguimiento.habitos h WHERE h.idhabito = recordatorios.idhabito AND h.idusuario = auth.uid()));

-- Tabla: perfil_salud (Dueño gestiona, Entrenador ve, Admin gestiona)
ALTER TABLE seguimiento.perfil_salud ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salud: Dueño gestiona" ON seguimiento.perfil_salud FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Salud: Entrenador ve salud de pupilo" ON seguimiento.perfil_salud FOR SELECT USING (seguimiento.es_entrenador_de(idusuario));
CREATE POLICY "Salud: Admin gestiona" ON seguimiento.perfil_salud FOR ALL USING (gestion.es_admin());

-- Tabla: entrenadores (Lectura pública, Gestión Admin)
ALTER TABLE seguimiento.entrenadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entrenadores: Lectura pública" ON seguimiento.entrenadores FOR SELECT USING (true);
CREATE POLICY "Entrenadores: Gestión Admin" ON seguimiento.entrenadores FOR ALL USING (gestion.es_admin());

-- Tabla: usuario_entrenador (Dueño, Entrenador implicado, Admin)
ALTER TABLE seguimiento.usuario_entrenador ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relacion: Acceso partes implicadas" ON seguimiento.usuario_entrenador FOR ALL 
USING (
    auth.uid() = idusuario OR 
    EXISTS (SELECT 1 FROM seguimiento.entrenadores e WHERE e.identrenador = usuario_entrenador.identrenador AND e.idusuario = auth.uid()) OR
    gestion.es_admin()
);

-- Tabla: rutinas, usuario_rutina, seguimientos (Usuario ve, Entrenador gestiona, Admin gestiona)
ALTER TABLE seguimiento.rutinas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rutinas: Usuario ve su rutina" ON seguimiento.rutinas FOR SELECT USING (EXISTS (SELECT 1 FROM seguimiento.usuario_rutina ur WHERE ur.idrutina = rutinas.idrutina AND ur.idusuario = auth.uid()));
CREATE POLICY "Rutinas: Entrenador gestiona sus rutinas" ON seguimiento.rutinas FOR ALL USING (EXISTS (SELECT 1 FROM seguimiento.entrenadores e WHERE e.identrenador = rutinas.identrenador AND e.idusuario = auth.uid()));
CREATE POLICY "Rutinas: Admin gestiona todo" ON seguimiento.rutinas FOR ALL USING (gestion.es_admin());

ALTER TABLE seguimiento.usuario_rutina ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento.seguimientos ENABLE ROW LEVEL SECURITY;
-- (Se repiten patrones similares de dueños e implicados para simplicidad)

/*====================================================
  4. ESQUEMA COMUNIDAD: CONFIGURACIÓN RLS
====================================================*/

-- Tabla: foros, articulos (Lectura pública, Gestión Admin)
ALTER TABLE comunidad.foros ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad.articulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foros/Artic: Lectura pública" ON comunidad.foros FOR SELECT USING (true);
CREATE POLICY "Foros/Artic: Lectura pública art" ON comunidad.articulos FOR SELECT USING (true);
CREATE POLICY "Foros/Artic: Gestión Admin" ON comunidad.foros FOR ALL USING (gestion.es_admin());
CREATE POLICY "Foros/Artic: Gestión Admin art" ON comunidad.articulos FOR ALL USING (gestion.es_admin());

-- Tabla: comentarios (Lectura pública, Gestión Autor, MODERACIÓN ADMIN)
ALTER TABLE comunidad.comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comentarios: Lectura pública" ON comunidad.comentarios FOR SELECT USING (true);
CREATE POLICY "Comentarios: Autor gestiona su comentario" ON comunidad.comentarios FOR ALL USING (auth.uid() = idusuario);
CREATE POLICY "Comentarios: Admin puede MODERAR (borrar)" ON comunidad.comentarios FOR DELETE USING (gestion.es_admin());

-- Tabla: reacciones (Lectura pública, Gestión Dueño)
ALTER TABLE comunidad.reacciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reacciones: Lectura pública" ON comunidad.reacciones FOR SELECT USING (true);
CREATE POLICY "Reacciones: Dueño gestiona reacción" ON comunidad.reacciones FOR ALL USING (auth.uid() = idusuario);

-- Tablas de Relación (usuario_foro, forum_admin, etc): Visibles para Admin e implicados
ALTER TABLE comunidad.usuario_foro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foro_User: Acceso implicado/Admin" ON comunidad.usuario_foro FOR ALL USING (auth.uid() = idusuario OR gestion.es_admin());

/*====================================================
  5. CONCESIÓN DE PERMISOS (GRANT)
  Permitir acceso a los roles de Supabase a los esquemas
====================================================*/

-- GRANT USAGE en los schemas personalizados
GRANT USAGE ON SCHEMA gestion    TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA seguimiento TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA comunidad  TO anon, authenticated, service_role;

-- GRANT SELECT/INSERT/UPDATE/DELETE en las tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gestion     TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA seguimiento  TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA comunidad   TO anon, authenticated;

-- service_role tiene acceso total (ignora RLS)
GRANT ALL ON ALL TABLES IN SCHEMA gestion     TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA seguimiento  TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA comunidad   TO service_role;

-- GRANT en secuencias (necesario para INSERT con gen_random_uuid)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gestion     TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA seguimiento  TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA comunidad   TO anon, authenticated, service_role;

-- GRANT en funciones
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gestion     TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA seguimiento  TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA comunidad   TO anon, authenticated, service_role;

-- Configuración para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA gestion     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA seguimiento GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA comunidad   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

