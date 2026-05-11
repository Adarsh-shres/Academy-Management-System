export type Role = "Teacher" | "Student" | "Admin" | "Super Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  course: string;
  phone: string;
  joinDate: string;
  status: "Active" | "Inactive" | "On Leave";
  avatar: string;
}

export const ROLES: Record<string, Role> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};
