import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTable() {
  const { data, error } = await supabase.from('batches').select('id').limit(1);
  if (error) {
    console.error('Error:', error.message, error.code);
  } else {
    console.log('Table exists, data:', data);
  }
}

testTable();
