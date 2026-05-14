import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing batch insertion...');
  const { data, error } = await supabase
    .from('batches')
    .insert([
      {
        name: 'Test Batch',
        code: 'BATCH-TEST-01',
        description: 'Test description',
        status: 'Active',
        course_ids: [],
        student_ids: []
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

testInsert();
