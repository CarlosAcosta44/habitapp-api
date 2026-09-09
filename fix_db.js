const { Client } = require('pg');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);

async function run() {
  const client = new Client({ connectionString: urlMatch[1] });
  await client.connect();
  
  console.log('Dropping constraint...');
  await client.query('ALTER TABLE public.habitos DROP CONSTRAINT IF EXISTS chk_habitos_estado;');
  console.log('Adding constraint...');
  await client.query("ALTER TABLE public.habitos ADD CONSTRAINT chk_habitos_estado CHECK (estado IN ('Activo', 'Inactivo', 'Completado', 'Archivado', 'Pausado'));");
  console.log('Done!');
  await client.end();
}
run().catch(console.error);
