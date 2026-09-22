require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.storage.getBucket('avatars');
  if (error) console.error("Error:", error);
  else console.log("Bucket exists:", data.name);
}
test();
