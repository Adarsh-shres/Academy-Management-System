export const studentProfile = {
  id: "STU-2024-001",
  name: "Arjun Sharma",
  email: "arjun.sharma@university.edu",
  avatar: "AS",
  course: "Bachelor of Computer Science",
  semester: "5th Semester",
  rollNo: "BCS-2022-045",
  department: "Computer Science & Engineering",
  batch: "2022–2026",
  phone: "+977 98XXXXXXXX",
  classGroup: "Morning - B",
};

export const courses = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    code: "CS301",
    instructor: "Dr. Priya Mehta",
    credits: 4,
    attendance: 87,
    totalClasses: 45,
    attendedClasses: 39,
    color: "#10b981",
    schedule: "Mon, Wed, Fri — 9:00 AM",
  },
  {
    id: 2,
    name: "Database Management Systems",
    code: "CS302",
    instructor: "Prof. Rajan Tiwari",
    credits: 3,
    attendance: 92,
    totalClasses: 38,
    attendedClasses: 35,
    color: "#10b981",
    schedule: "Tue, Thu — 11:00 AM",
  },
  {
    id: 3,
    name: "Operating Systems",
    code: "CS303",
    instructor: "Dr. Sunita Rao",
    credits: 4,
    attendance: 74,
    totalClasses: 42,
    attendedClasses: 31,
    color: "#10b981",
    schedule: "Mon, Wed — 2:00 PM",
  },
  {
    id: 4,
    name: "Computer Networks",
    code: "CS304",
    instructor: "Prof. Aman Verma",
    credits: 3,
    attendance: 95,
    totalClasses: 36,
    attendedClasses: 34,
    color: "#10b981",
    schedule: "Tue, Thu, Sat — 10:00 AM",
  },
  {
    id: 5,
    name: "Software Engineering",
    code: "CS305",
    instructor: "Dr. Kavita Joshi",
    credits: 3,
    attendance: 81,
    totalClasses: 32,
    attendedClasses: 26,
    color: "#10b981",
    schedule: "Wed, Fri — 3:00 PM",
  },
];

export const assignments = [
  {
    id: 1,
    title: "Binary Search Tree Implementation",
    course: "Data Structures & Algorithms",
    courseCode: "CS301",
    deadline: "2025-04-12",
    status: "pending",
    description: "Implement a BST with insert, delete, and traversal operations in C++.",
    marks: 20,
    submittedOn: null,
    grade: null
  },
  {
    id: 2,
    title: "ER Diagram for E-Commerce DB",
    course: "Database Management Systems",
    courseCode: "CS302",
    deadline: "2025-04-15",
    status: "pending",
    description: "Design a complete ER diagram for an e-commerce platform with normalization.",
    marks: 15,
    submittedOn: null,
    grade: null
  },
  {
    id: 3,
    title: "Process Scheduling Simulation",
    course: "Operating Systems",
    courseCode: "CS303",
    deadline: "2025-04-08",
    status: "submitted",
    description: "Simulate FCFS, SJF and Round Robin scheduling algorithms.",
    marks: 25,
    submittedOn: "2025-04-07",
    grade: "A",
  },
  {
    id: 4,
    title: "TCP/IP Protocol Analysis",
    course: "Computer Networks",
    courseCode: "CS304",
    deadline: "2025-04-20",
    status: "pending",
    description: "Analyze packet flow using Wireshark and write a 5-page report.",
    marks: 30,
    submittedOn: null,
    grade: null
  },
  {
    id: 5,
    title: "Agile Sprint Planning Report",
    course: "Software Engineering",
    courseCode: "CS305",
    deadline: "2025-03-30",
    status: "submitted",
    description: "Document a full sprint cycle for a hypothetical project.",
    marks: 20,
    submittedOn: "2025-03-28",
    grade: "A+",
  },
  {
    id: 6,
    title: "Graph Algorithms Lab",
    course: "Data Structures & Algorithms",
    courseCode: "CS301",
    deadline: "2025-03-20",
    status: "submitted",
    description: "Implement BFS, DFS, Dijkstra's and A* algorithms.",
    marks: 15,
    submittedOn: "2025-03-19",
    grade: "B+",
  },
];

export const schedule = [
  // Sunday
  { id: 0, day: "Sunday", time: "10:00 AM – 12:00 PM", subject: "Software Engineering", teacher: "Dr. Kavita Joshi", room: "LH-401", type: "lecture" },
  { id: 17, day: "Sunday", time: "2:00 PM – 4:00 PM", subject: "DBMS Lab", teacher: "Prof. Rajan Tiwari", room: "Lab-01", type: "lab" },

  // Monday
  { id: 1, day: "Monday", time: "9:00 AM – 10:00 AM", subject: "Data Structures & Algorithms", teacher: "Dr. Priya Mehta", room: "LH-301", type: "lecture" },
  { id: 2, day: "Monday", time: "10:00 AM – 11:00 AM", subject: "Operating Systems", teacher: "Dr. Sunita Rao", room: "LH-204", type: "lecture" },
  { id: 3, day: "Monday", time: "2:00 PM – 4:00 PM", subject: "DBMS Lab", teacher: "Prof. Rajan Tiwari", room: "Lab-01", type: "lab" },

  // Tuesday
  { id: 4, day: "Tuesday", time: "11:00 AM – 12:00 PM", subject: "Database Management Systems", teacher: "Prof. Rajan Tiwari", room: "LH-103", type: "lecture" },
  { id: 5, day: "Tuesday", time: "10:00 AM – 11:00 AM", subject: "Computer Networks", teacher: "Prof. Aman Verma", room: "LH-202", type: "lecture" },
  { id: 6, day: "Tuesday", time: "3:00 PM – 5:00 PM", subject: "OS Lab", teacher: "Dr. Sunita Rao", room: "Lab-02", type: "lab" },

  // Wednesday
  { id: 7, day: "Wednesday", time: "9:00 AM – 10:00 AM", subject: "Data Structures & Algorithms", teacher: "Dr. Priya Mehta", room: "LH-301", type: "lecture" },
  { id: 8, day: "Wednesday", time: "2:00 PM – 3:00 PM", subject: "Operating Systems", teacher: "Dr. Sunita Rao", room: "LH-204", type: "lecture" },
  { id: 9, day: "Wednesday", time: "3:00 PM – 4:00 PM", subject: "Software Engineering", teacher: "Dr. Kavita Joshi", room: "LH-401", type: "lecture" },

  // Thursday
  { id: 10, day: "Thursday", time: "11:00 AM – 12:00 PM", subject: "Database Management Systems", teacher: "Prof. Rajan Tiwari", room: "LH-103", type: "lecture" },
  { id: 11, day: "Thursday", time: "10:00 AM – 11:00 AM", subject: "Computer Networks", teacher: "Prof. Aman Verma", room: "LH-202", type: "lecture" },
  { id: 12, day: "Thursday", time: "2:00 PM – 4:00 PM", subject: "Networks Lab", teacher: "Prof. Aman Verma", room: "Lab-03", type: "lab" },

  // Friday
  { id: 13, day: "Friday", time: "9:00 AM – 10:00 AM", subject: "Data Structures & Algorithms", teacher: "Dr. Priya Mehta", room: "LH-301", type: "lecture" },
  { id: 14, day: "Friday", time: "3:00 PM – 4:00 PM", subject: "Software Engineering", teacher: "Dr. Kavita Joshi", room: "LH-401", type: "lecture" },
];

export const recentActivity = [
  { id: 1, type: "submitted", text: "Submitted 'Agile Sprint Planning Report'", time: "2 days ago", icon: "check" },
  { id: 2, type: "grade", text: "Grade received for 'Graph Algorithms Lab' — B+", time: "3 days ago", icon: "star" },
  { id: 3, type: "enrolled", text: "New assignment posted in Computer Networks", time: "4 days ago", icon: "bell" },
  { id: 4, type: "attendance", text: "Attendance marked for Operating Systems", time: "5 days ago", icon: "calendar" },
  { id: 5, type: "grade", text: "Grade received for 'Process Scheduling Simulation' — A", time: "1 week ago", icon: "star" },
];
