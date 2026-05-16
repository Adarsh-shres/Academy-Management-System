import { supabase } from './supabase';

export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

export const fetchUsersInChunks = async (userIds: string[]) => {
  if (!userIds || userIds.length === 0) return [];
  const uniqueIds = [...new Set(userIds.filter(Boolean))].map(String);
  const chunks = chunkArray(uniqueIds, 10);
  let allUsers: any[] = [];
  
  for (const chunk of chunks) {
    // Use the same columns that work everywhere else (id, name, email, role)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('id', chunk);
      
    if (error) {
      console.error('[Chat] Error fetching users chunk:', error);
      // Try with wildcard as fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('users')
        .select('*')
        .in('id', chunk);
      if (fallbackError) {
        console.error('[Chat] Fallback also failed:', fallbackError);
      } else if (fallbackData) {
        allUsers = [...allUsers, ...fallbackData.map((u: any) => ({
          ...u,
          full_name: u.full_name || u.name || 'Unknown',
        }))];
      }
    } else if (data) {
      // Map 'name' column to 'full_name' for backward compatibility with chat components
      allUsers = [...allUsers, ...data.map((u: any) => ({
        ...u,
        full_name: u.name || 'Unknown',
      }))];
      console.log(`[Chat] chunk of ${chunk.length} ids returned ${data.length} users`);
    }
  }
  
  const foundIds = allUsers.map((u: any) => u.id);
  const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
  if (missingIds.length > 0) {
    console.warn('[Chat] missing user ids after lookup:', missingIds);
  }
  
  return allUsers;
};

export const getSenderNameFallback = (user: any, currentUserId?: string, fallbackId?: string) => {
  if (!user && fallbackId === currentUserId) return 'You';
  if (!user) return 'Unknown';
  if (user.id === currentUserId) return 'You';
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  return 'Unknown';
};

export const getInitials = (name?: string): string => {
  if (!name || name === 'Unknown') return '?';
  if (name === 'You') return 'Y';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
};
