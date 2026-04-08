// useUsers.ts
import { useState, useMemo } from "react";
import { type User, initialUsers, generateId, ROLES } from "../data/mockUsers.ts";

export interface UserStats {
  total: number;
  teachers: number;
  students: number;
  active: number;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Stats calculation
  const stats: UserStats = useMemo(() => {
    return {
      total: users.length,
      teachers: users.filter((u) => u.role === ROLES.TEACHER).length,
      students: users.filter((u) => u.role === ROLES.STUDENT).length,
      active: users.filter((u) => u.status === "Active").length,
    };
  }, [users]);

  // CRUD Operations
  const addUser = (userData: Omit<User, "id" | "joinDate" | "avatar">) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      joinDate: new Date().toISOString().split("T")[0],
      avatar: userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
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
  };
};
