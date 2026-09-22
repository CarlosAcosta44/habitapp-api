-- La tabla comunidad.habitos_publicados ya existe con estas columnas:
-- idpublicacion (uuid), idusuario (uuid), nombre_habito (varchar), descripcion (varchar), idcategoria (uuid),
-- meta_diaria (int4), unidad_medida (varchar), dias_semana (int4[]), likes (int4), fechapublicacion (date)

-- Solo necesitamos añadir la columna clones_count para llevar el registro
ALTER TABLE comunidad.habitos_publicados ADD COLUMN IF NOT EXISTS clones_count INT DEFAULT 0;

-- Arreglar permisos para que la API REST (Supabase) pueda leer e insertar
GRANT ALL ON comunidad.habitos_publicados TO service_role;
GRANT ALL ON comunidad.habitos_publicados TO authenticated;
GRANT SELECT ON comunidad.habitos_publicados TO anon;

-- Habilitar RLS si se desea, o políticas básicas
ALTER TABLE comunidad.habitos_publicados ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda ver los hábitos publicados
CREATE POLICY "Publicados visibles para todos" ON comunidad.habitos_publicados
FOR SELECT USING (true);

-- Política para que los usuarios autenticados puedan publicar
CREATE POLICY "Usuarios pueden publicar sus propios hábitos" ON comunidad.habitos_publicados
FOR INSERT WITH CHECK (auth.uid() = idusuario);

-- Política para actualizar (sumar clones_count)
CREATE POLICY "Actualizar conteo de clones" ON comunidad.habitos_publicados
FOR UPDATE USING (true);

-- Función RPC para incrementar contadores sin riesgo de condiciones de carrera
CREATE OR REPLACE FUNCTION increment_clones_count(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comunidad.habitos_publicados
  SET clones_count = clones_count + 1
  WHERE idpublicacion = row_id;
END;
$$ LANGUAGE plpgsql;
