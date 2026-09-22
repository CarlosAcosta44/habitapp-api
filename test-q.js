require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.schema('comunidad').from('qoutes').select('*');
  console.log("QOUTES Error:", error);
  console.log("QOUTES Data:", data);

  const { data: d2, error: e2 } = await supabase.schema('comunidad').from('quotes').select('*');
  console.log("QUOTES Error:", e2);
  console.log("QUOTES Data:", d2);
}
test();
