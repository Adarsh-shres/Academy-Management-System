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

  const addUser = (userData: Omit<User, 'id' | 'joinDate' | 'avatar'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      joinDate: new Date().toISOString().split('T')[0],
      avatar: userData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const bulkDelete = (ids: string[]) => {
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
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
