import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfxellwzfevdhfqrvfmh.supabase.co/'
const supabaseAnonKey = 'sb_publishable_W8gyM39VqnaPXZyRqEOIbw_KJJ9jZ3L'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser() {
  console.log('Signing up user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'ram@s.edu',
    password: 'ram1234',
  })

  let userId = null;

  if (authError) {
    console.error('Auth error:', authError)
    
    // Check if the user already exists and we just need to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'ram@s.edu',
        password: 'ram1234',
    });
    if (signInData?.user) {
        console.log('User signed in successfully', signInData.user.id);
        userId = signInData.user.id;
    } else {
        console.error('SignIn error:', signInError);
    }
  } else {
    console.log('Signup success');
    userId = authData?.user?.id;
  }
  
  if (userId) {
    await checkProfile(userId);
  }
}

async function checkProfile(userId) {
    console.log('Checking profile in public.users...');
    const { data: profile } = await supabase.from('users').select('*').eq('id', userId).limit(1);
    
    if (!profile || profile.length === 0) {
        console.log('Profile not found, inserting...');
        const { error: profileError } = await supabase.from('users').insert([{
            id: userId,
            email: 'ram@s.edu',
            name: 'Ram',
            role: 'teacher'
        }])
        
        if (profileError) {
            console.error('Profile insert error:', profileError)
        } else {
            console.log('Profile inserted successfully')
        }
    } else {
        console.log('Profile exists:', profile[0]);
    }
}

createUser()
