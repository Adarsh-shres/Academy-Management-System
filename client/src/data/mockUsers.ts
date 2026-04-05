// mockUsers.ts
export type Role = "Teacher" | "Student";

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

export const initialUsers: User[] = [
  {
    id: "u001",
    name: "Dr. Ramesh Kumar",
    email: "ramesh.k@academy.edu",
    role: ROLES.TEACHER,
    department: "Internet Software Architecture",
    course: "Quantum Physics & Applied Mechanics",
    phone: "+977 9869454636",
    joinDate: "2022-08-15",
    status: "Active",
    avatar: "RK",
  },
  {
    id: "u002",
    name: "Prof. Sunita Sharma",
    email: "sunita.s@academy.edu",
    role: ROLES.TEACHER,
    department: "Fundamentals of Computing",
    course: "Data Structures & Algorithms",
    phone: "+977 9869454636",
    joinDate: "2021-01-10",
    status: "Active",
    avatar: "SS",
  },
  {
    id: "u003",
    name: "Dr. Priya Menon",
    email: "priya.m@academy.edu",
    role: ROLES.TEACHER,
    department: "Introductory Programming And Problem Solving",
    course: "Organic Chemistry",
    phone: "+977 9869454636",
    joinDate: "2023-09-01",
    status: "On Leave",
    avatar: "PM",
  },
  {
    id: "u004",
    name: "Prof. Suresh Pillai",
    email: "suresh.p@academy.edu",
    role: ROLES.TEACHER,
    department: "Interactive 3D Applications and Academic Skills",
    course: "Advanced Calculus & Linear Algebra",
    phone: "+977 9869454636",
    joinDate: "2023-09-01",
    status: "Active",
    avatar: "SP",
  },
  {
    id: "u005",
    name: "Dr. Kavitha Nair",
    email: "kavitha.n@academy.edu",
    role: ROLES.TEACHER,
    department: "Introduction to Object-Oriented Programming",
    course: "Structural Engineering",
    phone: "+977 9869454636",
    joinDate: "2020-03-22",
    status: "Inactive",
    avatar: "KN",
  },
  {
    id: "u006",
    name: "Prof. Anand Desai",
    email: "anand.d@academy.edu",
    role: ROLES.TEACHER,
    department: "Computational Mathematics",
    course: "Microeconomics & Public Policy",
    phone: "+977 9869454636",
    joinDate: "2024-01-15",
    status: "Active",
    avatar: "AD",
  },
  {
    id: "u007",
    name: "Hari Thapa",
    email: "hari.t@students.academy.edu",
    role: ROLES.STUDENT,
    department: "Object-Oriented Design and Programming",
    course: "Advanced OOP",
    phone: "+977 9869454636",
    joinDate: "2023-09-01",
    status: "Active",
    avatar: "HT",
  },
  {
    id: "u008",
    name: "Lal Bahadur Pandit",
    email: "lal.b@academy.edu",
    role: ROLES.TEACHER,
    department: "Full stack Development",
    course: "React & Node",
    phone: "+977 9869454636",
    joinDate: "2019-07-30",
    status: "Active",
    avatar: "LP",
  },
];

export const generateId = () =>
  "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
