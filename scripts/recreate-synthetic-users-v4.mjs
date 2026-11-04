/**
 * @file scripts/recreate-synthetic-users-v4.mjs
 * @description Crea 25 usuarios sintéticos en Supabase Auth (auth.users).
 * El trigger `trigger_crear_perfil` los sincroniza a gestion.usuarios.
 *
 * EJECUCIÓN: node scripts/recreate-synthetic-users-v4.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PASSWORD =
  process.env.SYNTHETIC_USER_PASSWORD ||
  process.env.TEST_USER_PASSWORD ||
  `HabitApp_${Date.now()}!`;

const USERS = [
  { email: 'admin.carlos.habitapp@gmail.com',  nombre: 'Carlos',    apellido: 'Mendoza',   genero: 'Masculino' },
  { email: 'admin.diana.habitapp@gmail.com',   nombre: 'Diana',     apellido: 'Ríos',      genero: 'Femenino'  },
  { email: 'coach.andres.habitapp@gmail.com',  nombre: 'Andrés',    apellido: 'Torres',    genero: 'Masculino' },
  { email: 'coach.camila.habitapp@gmail.com',  nombre: 'Camila',    apellido: 'Vargas',    genero: 'Femenino'  },
  { email: 'coach.felipe.habitapp@gmail.com',  nombre: 'Felipe',    apellido: 'Gutiérrez', genero: 'Masculino' },
  { email: 'coach.laura.habitapp@gmail.com',   nombre: 'Laura',     apellido: 'Jiménez',   genero: 'Femenino'  },
  { email: 'coach.nicolas.habitapp@gmail.com', nombre: 'Nicolás',   apellido: 'Castillo',  genero: 'Masculino' },
  { email: 'sofia6.habitapp@gmail.com',        nombre: 'Sofía',     apellido: 'López',     genero: 'Femenino'  },
  { email: 'miguel7.habitapp@gmail.com',       nombre: 'Miguel',    apellido: 'Fernández', genero: 'Masculino' },
  { email: 'valentina8.habitapp@gmail.com',    nombre: 'Valentina', apellido: 'Martínez',  genero: 'Femenino'  },
  { email: 'juan9.habitapp@gmail.com',         nombre: 'Juan',      apellido: 'García',    genero: 'Masculino' },
  { email: 'isabella10.habitapp@gmail.com',    nombre: 'Isabella',  apellido: 'Rodríguez', genero: 'Femenino'  },
  { email: 'santiago11.habitapp@gmail.com',    nombre: 'Santiago',  apellido: 'Pérez',     genero: 'Masculino' },
  { email: 'mariana12.habitapp@gmail.com',     nombre: 'Mariana',   apellido: 'Sánchez',   genero: 'Femenino'  },
  { email: 'samuel13.habitapp@gmail.com',      nombre: 'Samuel',    apellido: 'Ramírez',   genero: 'Masculino' },
  { email: 'daniela14.habitapp@gmail.com',     nombre: 'Daniela',   apellido: 'Cruz',      genero: 'Femenino'  },
  { email: 'mateo15.habitapp@gmail.com',       nombre: 'Mateo',     apellido: 'Morales',   genero: 'Masculino' },
  { email: 'paula16.habitapp@gmail.com',       nombre: 'Paula',     apellido: 'Herrera',   genero: 'Femenino'  },
  { email: 'sebastian17.habitapp@gmail.com',   nombre: 'Sebastián', apellido: 'Medina',    genero: 'Masculino' },
  { email: 'andrea18.habitapp@gmail.com',      nombre: 'Andrea',    apellido: 'Rojas',     genero: 'Femenino'  },
  { email: 'david19.habitapp@gmail.com',       nombre: 'David',     apellido: 'Ortiz',     genero: 'Masculino' },
  { email: 'natalia20.habitapp@gmail.com',     nombre: 'Natalia',   apellido: 'Silva',     genero: 'Femenino'  },
  { email: 'alejandro21.habitapp@gmail.com',   nombre: 'Alejandro', apellido: 'Mora',      genero: 'Masculino' },
  { email: 'catalina22.habitapp@gmail.com',    nombre: 'Catalina',  apellido: 'Serrano',   genero: 'Femenino'  },
  { email: 'julian23.habitapp@gmail.com',      nombre: 'Julián',    apellido: 'Varela',    genero: 'Masculino' },
]

async function main() {
  console.log('🚀 Creando usuarios sintéticos en Supabase Auth...\n')
  let created = 0, skipped = 0, errors = 0

  for (const user of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nombre: user.nombre, apellido: user.apellido, genero: user.genero },
    })
    if (error) {
      if (error.message?.includes('already') || error.code === 'email_exists') {
        console.log(`⏭️  ${user.email} — ya existe`)
        skipped++
      } else {
        console.error(`❌ ${user.email} — ${error.message}`)
        errors++
      }
    } else {
      console.log(`✅ ${user.email} — ${data.user?.id?.slice(0,8)}...`)
      created++
    }
    await new Promise(r => setTimeout(r, 250))
  }

  console.log(`\n✅ Creados: ${created} | ⏭️ Omitidos: ${skipped} | ❌ Errores: ${errors}`)
  console.log(`\n📧 Login: sofia6.habitapp@gmail.com  🔑 ${PASSWORD}`)
  console.log(`\n➡️  Ahora ejecuta el SQL "4. Script Datos Sinteticos Masivos.sql" en Supabase SQL Editor.`)
}

main().catch((err) => {
  console.error('Error running synthetic users script:', err);
  process.exit(1);
});
