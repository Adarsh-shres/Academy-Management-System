import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { type User, ROLES, generateId } from '../data/mockUsers.ts';

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
  if (row.role !== 'teacher' && row.role !== 'student') {
    return null;
  }

  const name = row.name?.trim() || 'Unnamed User';

  return {
    id: row.id,
    name,
    email: row.email ?? '',
    role: row.role === 'teacher' ? ROLES.TEACHER : ROLES.STUDENT,
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
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .in('role', ['teacher', 'student'])
      .order('name', { ascending: true });

    if (error) {
      console.error('[useUsers] Failed to load users:', error.message);
      return;
    }

    const mappedUsers = (data as SupabaseUserRow[])
      .map(toDisplayUser)
      .filter((user): user is User => Boolean(user));

    setUsers(mappedUsers);
  }, []);

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
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'admin' // In a real app, this would come from useAuth
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          role: userData.role === ROLES.TEACHER ? 'teacher' : 'student'
        })
      });
      if (!response.ok) throw new Error('Failed to create user');
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role === ROLES.TEACHER ? 'teacher' : 'student'
        })
      });
      if (!response.ok) throw new Error('Failed to update user');
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'admin' }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await deleteUser(id);
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
