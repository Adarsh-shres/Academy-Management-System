// mockUsers.ts
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

export const DEPARTMENTS = [
  "Internet Software Architecture",
  "Fundamentals of Computing",
  "Introductory Programming And Problem Solving",
  "Interactive 3D Applications and Academic Skills",
  "Introduction to Object-Oriented Programming",
  "Computational Mathematics",
  "Object-Oriented Design and Programming",
  "Full stack Development",
  "Collaborative Development",
  "Algorithms and Concurrency",
  "Cloud Systems",
];

export const COURSES = [
  "Web Architecture",
  "OS Components",
  "Python Basics",
  "Unity 3D",
  "Java Core",
  "Discrete Structures",
  "Advanced OOP",
  "React & Node",
  "Agile Workflows",
  "Parallel Processing",
  "AWS Solutions",
];

export const generateId = () =>
  "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
