import { supabase } from './supabase';

export type ProvisionedRole = 'admin' | 'teacher' | 'student';

export interface ProvisionUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: ProvisionedRole;
  profile?: Record<string, unknown>;
}

interface ProvisionUserResponse {
  message?: string;
  user_id?: string;
  error?: string;
}

export async function provisionUser(payload: ProvisionUserRequest): Promise<ProvisionUserResponse> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again and retry.');
  }

  const { data, error } = await supabase.functions.invoke<ProvisionUserResponse>('create-user', {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    const httpContext = (error as { context?: Response }).context;

    if (httpContext) {
      let errorBody: ProvisionUserResponse | null = null;

      try {
        errorBody = (await httpContext.clone().json()) as ProvisionUserResponse;
      } catch {
        try {
          const text = await httpContext.text();
          if (text.trim()) {
            throw new Error(text);
          }
        } catch (bodyError) {
          if (bodyError instanceof Error && bodyError.message.trim()) {
            throw bodyError;
          }
        }
      }

      if (errorBody?.error) {
        throw new Error(errorBody.error);
      }
    }

    throw new Error(error.message || 'Failed to call create-user function.');
  }

  if (!data) {
    throw new Error('No response returned by create-user function.');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
