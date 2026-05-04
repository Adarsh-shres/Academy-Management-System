import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { type User, ROLES, generateId } from '../data/mockUsers.ts';
import { useAuth } from '../context/AuthContext';

export interface UserStats {
  total: number;
  teachers: number;
  students: number;
  active: number;
}

interface SupabaseUserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
}

function toDisplayUser(row: SupabaseUserRow): User | null {
  if (!['teacher', 'student', 'admin', 'super_admin'].includes(row.role || '')) {
    return null;
  }

  const name = row.name?.trim() || 'Unnamed User';

  let roleEnum = ROLES.STUDENT;
  if (row.role === 'teacher') roleEnum = ROLES.TEACHER;
  else if (row.role === 'admin') roleEnum = ROLES.ADMIN;
  else if (row.role === 'super_admin') roleEnum = ROLES.SUPER_ADMIN;

  return {
    id: row.id,
    name,
    email: row.email ?? '',
    role: roleEnum,
    department: '',
    course: '',
    phone: '',
    joinDate: '',
    status: 'Active',
    avatar: name
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}

export const useUsers = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'x-user-role': authUser?.role || ''
    };
  }, [authUser]);

  const loadUsers = useCallback(async () => {
    if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'super_admin')) return;

    try {
      const response = await fetch('http://localhost:5000/users', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to load users');
      
      const data = await response.json();
      const mappedUsers = (data as SupabaseUserRow[])
        .map(toDisplayUser)
        .filter((user): user is User => Boolean(user));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('[useUsers] Failed to load users:', error);
    }
  }, [authUser, getHeaders]);

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

  const addUser = async (userData: Omit<User, 'id' | 'joinDate' | 'avatar'>) => {
    try {
      const mappedRole = Object.entries(ROLES).find(([, value]) => value === userData.role)?.[0].toLowerCase();
      
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: mappedRole || 'student'
        })
      });

      if (!response.ok) throw new Error('Failed to add user');
      
      // Reload to get the new user with DB ID
      await loadUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const mappedRole = Object.entries(ROLES).find(([, value]) => value === updatedUser.role)?.[0].toLowerCase();

      const response = await fetch(`http://localhost:5000/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          role: mappedRole || 'student'
        })
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      // The current backend doesn't have bulk delete, so we loop
      for (const id of ids) {
        await fetch(`http://localhost:5000/users/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      }
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
