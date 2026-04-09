import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student';
type CreatableRole = Exclude<UserRole, 'super_admin'>;

interface CreateUserPayload {
  email?: string;
  password?: string;
  fullName?: string;
  role?: CreatableRole;
  profile?: Record<string, unknown>;
}

const ALLOWED_CREATIONS: Record<'super_admin' | 'admin', CreatableRole[]> = {
  super_admin: ['admin', 'teacher', 'student'],
  admin: ['teacher', 'student'],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing Authorization bearer token.');
    }

    const accessToken = authHeader.replace('Bearer ', '').trim();
    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (callerError || !caller) {
      throw new Error('Invalid or expired session.');
    }

    const { data: callerRow, error: callerRoleError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerRoleError || !callerRow?.role) {
      throw new Error('Caller role could not be resolved from public.users.');
    }

    const callerRole = callerRow.role as UserRole;
    if (callerRole !== 'super_admin' && callerRole !== 'admin') {
      throw new Error('Permission denied. Only super_admin or admin can create users.');
    }

    const body = (await req.json()) as CreateUserPayload;
    const email = body.email ? normalizeEmail(body.email) : '';
    const password = body.password?.trim() ?? '';
    const fullName = body.fullName?.trim() ?? '';
    const targetRole = body.role;
    const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};

    if (!email) {
      throw new Error('Email is required.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!fullName) {
      throw new Error('Full name is required.');
    }
    if (!targetRole) {
      throw new Error('Target role is required.');
    }
    if (!['admin', 'teacher', 'student'].includes(targetRole)) {
      throw new Error('Invalid target role.');
    }

    const allowedTargets = ALLOWED_CREATIONS[callerRole];
    if (!allowedTargets.includes(targetRole)) {
      throw new Error(`Permission denied. ${callerRole} cannot create ${targetRole}.`);
    }

    const {
      data: createdAuthData,
      error: createAuthError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: targetRole,
        profile,
      },
    });

    if (createAuthError || !createdAuthData.user) {
      throw createAuthError ?? new Error('Auth user creation failed.');
    }

    const createdUser = createdAuthData.user;

    const { error: upsertError } = await supabaseAdmin.from('users').upsert(
      {
        id: createdUser.id,
        email,
        name: fullName,
        role: targetRole,
      },
      { onConflict: 'id' },
    );

    if (upsertError) {
      await supabaseAdmin.auth.admin.deleteUser(createdUser.id);
      throw upsertError;
    }

    return jsonResponse({
      success: true,
      message: `${targetRole} account created successfully.`,
      user_id: createdUser.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return jsonResponse({ error: message }, 400);
  }
});
