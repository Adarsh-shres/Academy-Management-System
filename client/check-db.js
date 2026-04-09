import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfxellwzfevdhfqrvfmh.supabase.co/';
const supabaseKey = 'sb_publishable_W8gyM39VqnaPXZyRqEOIbw_KJJ9jZ3L';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['assignments', 'courses', 'attendance', 'enrollments', 'student_profiles'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table: ${table}`);
    if (error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Exists! Sample:`, JSON.stringify(data[0] || null));
    }
    console.log('---');
  }
}

checkTables();
