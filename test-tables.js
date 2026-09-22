require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.rpc('get_tables_in_schema', { schema_name: 'comunidad' });
  if (error) {
     // fallback to pg_class
     const { data: d2, error: e2 } = await supabase.from('pg_tables').select('*');
     console.log("pg_tables:", d2, e2);
  } else {
    console.log("Tables:", data);
  }
}
test();
