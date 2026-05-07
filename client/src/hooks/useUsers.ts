import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { provisionUser, type ProvisionedRole } from '../lib/userProvisioning';
import { ROLES, type User } from '../data/mockUsers.ts';

export interface UserStats {
  total: number;
  teachers: number;
  students: number;
  active: number;
}

export const useUsers = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'super_admin')) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .order('name', { ascending: true });

      if (error) throw error;

      const mappedUsers: User[] = (data || []).map((row: any) => {
        let roleEnum = ROLES.STUDENT;
        if (row.role === 'teacher') roleEnum = ROLES.TEACHER;
        else if (row.role === 'admin') roleEnum = ROLES.ADMIN;
        else if (row.role === 'super_admin') roleEnum = ROLES.SUPER_ADMIN;

        const name = row.name?.trim() || 'Unnamed User';
        return {
          id: row.id,
          name,
          email: row.email ?? '',
          role: roleEnum,
          department: '',
          course: '',
          phone: '',
          joinDate: new Date(row.created_at || Date.now()).toLocaleDateString(),
          status: 'Active',
          avatar: name
            .split(' ')
            .map((part: string) => part[0] ?? '')
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error('[useUsers] Failed to load users:', error);
    }
  }, [authUser]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const stats: UserStats = useMemo(() => {
    return {
      total: users.length,
      teachers: users.filter((u) => u.role === ROLES.TEACHER).length,
      students: users.filter((u) => u.role === ROLES.STUDENT).length,
      active: users.filter((u) => u.status === 'Active').length,
    };
  }, [users]);

  // Provide an interface for creating a new user using the edge function
  const addUser = async (userData: { email: string; name: string; role: string; password?: string }) => {
    try {
      let mappedRole: ProvisionedRole = 'student';
      if (userData.role === ROLES.TEACHER || userData.role === 'teacher') mappedRole = 'teacher';
      else if (userData.role === ROLES.ADMIN || userData.role === 'admin') mappedRole = 'admin';

      await provisionUser({
        email: userData.email,
        password: userData.password || 'TemporaryPassword123!',
        fullName: userData.name,
        role: mappedRole,
      });

      await loadUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const mappedRole = Object.entries(ROLES).find(([, value]) => value === updatedUser.role)?.[0].toLowerCase() || 'student';

      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          role: mappedRole,
        })
        .eq('id', updatedUser.id);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase.from('users').delete().in('id', ids);
      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      throw error;
    }
  };

  return {
    users,
    stats,
    addUser,
    updateUser,
    deleteUser,
    bulkDelete,
    refreshUsers: loadUsers,
  };
};
