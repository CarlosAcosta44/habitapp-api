const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);
async function run() {
  const { data, error } = await supabase.from('registro_habitos').select('*');
  console.log('Error:', error);
  console.log('Rows count:', data.length);
  // group by habit and date
  const counts = {};
  for (const row of data) {
    const key = `${row.idhabito}-${row.fecha}`;
    counts[key] = (counts[key] || 0) + 1;
    if (counts[key] > 1) {
      console.log('DUPLICATE FOUND:', key, row);
    }
  }
}
run();
