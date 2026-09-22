require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('quotes').select('*');
  if (error) console.error("Error:", error);
  else console.log("Data:", data.length, data[0]);
}
test();
