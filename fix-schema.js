const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:27dedicde2007@db.evewseepikzqstsvrjai.supabase.co:5432/postgres'
});
client.connect()
  .then(() => {
    console.log('Connected to pg!');
    return client.query("ALTER TABLE comunidad.foros ALTER COLUMN descripcion TYPE text; ALTER TABLE comunidad.foros ALTER COLUMN titulo TYPE varchar(255);");
  })
  .then(() => {
    console.log('Columns altered!');
    return client.query("NOTIFY pgrst, 'reload schema';");
  })
  .then(() => {
    console.log('Cache reloaded!');
    client.end();
  })
  .catch(e => {
    console.error('Connection error', e);
    client.end();
  });
