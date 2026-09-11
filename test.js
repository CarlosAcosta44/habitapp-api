require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function run() {
  const { data, error } = await supabase.schema('seguimiento').from('habitos').select('*').eq('idusuario', '0fc906ba-c6ac-4cf7-b33b-624cbed8d27f');
  console.log(data);
}
run();
