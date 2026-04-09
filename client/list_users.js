import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfxellwzfevdhfqrvfmh.supabase.co/'
const supabaseAnonKey = 'sb_publishable_W8gyM39VqnaPXZyRqEOIbw_KJJ9jZ3L'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listUsers() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users in public.users:');
        console.log(users);
    }
}

listUsers();
