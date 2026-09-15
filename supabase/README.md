# Estructura de Supabase (HabitApp)

Esta carpeta contiene la definición completa de la base de datos de HabitApp siguiendo el estándar de Supabase Local Development.

## ¿Qué hay aquí?

### 1. migrations/
Contiene todos los scripts SQL de esquema de base de datos.
Al levantar Supabase, estos scripts se ejecutan en orden secuencial (según su prefijo numérico/fecha) para recrear todas las tablas, vistas, enums, triggers y políticas de seguridad (RLS).

### 2. seed.sql
Contiene el script de **Datos Sintéticos Masivos**.
Después de que se ejecutan todas las migraciones, Supabase carga automáticamente este archivo para insertar datos de prueba. Aquí están los más de 100 usuarios, hábitos, misiones, registros y foros simulados para que el entorno de desarrollo sea 100% interactivo desde el minuto uno.

### 3. config.toml
Configuración local de Supabase (puertos, opciones de Auth, etc.).

## ¿Cómo levantar la base de datos localmente?

Si quieres recrear todo el entorno desde cero en tu máquina:

1. Asegúrate de tener Docker corriendo.
2. Instala la CLI de Supabase si no la tienes (npm install -g supabase).
3. Ejecuta en la raíz del proyecto backend:
   supabase start
   
Esto descargará los contenedores necesarios, aplicará el esquema e insertará los datos de prueba masivos de seed.sql.
