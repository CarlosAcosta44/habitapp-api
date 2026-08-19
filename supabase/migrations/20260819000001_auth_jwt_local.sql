-- 0. Limpiar usuarios sintéticos existentes para permitir agregar columnas NOT NULL sin error
TRUNCATE TABLE gestion.usuarios CASCADE;

-- 1. Agregar columnas de autenticación propia a gestion.usuarios
ALTER TABLE gestion.usuarios
  ADD COLUMN email          VARCHAR(255) UNIQUE NOT NULL,
  ADD COLUMN password_hash  VARCHAR(255),          
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN estado_cuenta  VARCHAR(20) NOT NULL DEFAULT 'Activo'
    CHECK (estado_cuenta IN ('Pendiente', 'Activo', 'Suspendido'));

-- Eliminar la FK hacia auth.users
ALTER TABLE gestion.usuarios DROP CONSTRAINT IF EXISTS usuarios_idusuario_fkey;

-- 2. Tabla de identidades OAuth
CREATE TABLE gestion.identidades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idusuario       UUID NOT NULL REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
  provider        VARCHAR(30) NOT NULL CHECK (provider IN ('google', 'facebook', 'apple', 'local')),
  provider_id     VARCHAR(255) NOT NULL,
  provider_email  VARCHAR(255),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, provider_id)
);

-- 3. Tabla de refresh tokens propios
CREATE TABLE gestion.refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idusuario    UUID NOT NULL REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
  token_hash   VARCHAR(255) NOT NULL UNIQUE,
  family_id    UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at   TIMESTAMP NOT NULL,
  revoked_at   TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de tokens de verificación / recuperación
CREATE TABLE gestion.verificacion_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idusuario  UUID NOT NULL REFERENCES gestion.usuarios(idusuario) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  tipo       VARCHAR(30) NOT NULL CHECK (tipo IN ('verificacion_email', 'reset_password')),
  expires_at   TIMESTAMP NOT NULL,
  used_at      TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Eliminar triggers y funciones relacionadas con auth.users
DROP TRIGGER IF EXISTS trigger_crear_perfil ON auth.users CASCADE;
DROP FUNCTION IF EXISTS gestion.crear_perfil_usuario() CASCADE;

DROP TRIGGER IF EXISTS trigger_sync_rol_auth ON gestion.usuarios CASCADE;
DROP FUNCTION IF EXISTS gestion.sync_rol_a_auth() CASCADE;
