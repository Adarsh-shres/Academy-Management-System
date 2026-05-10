import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { supabase } from '../lib/supabase.js';

const router = Router();

interface UserContext {
  role: 'super_admin' | 'admin' | 'teacher' | 'student' | 'guest';
  name: string;
  userId?: string;
}

async function fetchLiveData(ctx: UserContext): Promise<string> {
  if (!ctx.userId || ctx.role === 'guest') return 'No live data available for guest users.';

  let liveDataStr = '';

  try {
    if (ctx.role === 'admin' || ctx.role === 'super_admin') {
      const { count: studentCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student');
      const { count: teacherCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher');
      
      const { data: attendanceData } = await supabase.from('attendance').select('status');
      let attText = 'No attendance data';
      if (attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'Present').length;
        attText = `${Math.round((present / attendanceData.length) * 100)}% overall attendance`;
      }

      // Query both submissions and assignment_submissions silently
      let subCount = 0;
      let gradedCount = 0;
      try {
        const { data: subData } = await supabase.from('submissions').select('file_url');
        if (subData) {
          subCount = subData.length;
        }
      } catch (e) {}
      try {
        const { data: aSubData } = await supabase.from('assignment_submissions').select('status');
        if (aSubData) {
           subCount = subCount || aSubData.length;
           gradedCount = aSubData.filter(s => s.status === 'graded').length;
        }
      } catch(e) {}

      liveDataStr = `- Users: ${studentCount ?? 0} students, ${teacherCount ?? 0} teachers\n- Attendance: ${attText}\n- Submissions: ${subCount} total, ${gradedCount} graded`;
    }

    if (ctx.role === 'teacher') {
      const { data: assignments } = await supabase.from('assignments').select('title, due_date').eq('teacher_id', ctx.userId);
      let assignmentList = 'No active assignments';
      if (assignments && assignments.length > 0) {
        assignmentList = assignments.map(a => `${a.title} (Due: ${a.due_date})`).join(', ');
      }

      let pendingCount = 0;
      try {
        const { data: mySubmissions } = await supabase.from('submissions').select('id');
        pendingCount = mySubmissions ? mySubmissions.length : 0;
      } catch(e) {}
      try {
        const { data: assignIds } = await supabase.from('assignments').select('id').eq('teacher_id', ctx.userId);
        if (assignIds && assignIds.length > 0) {
          const ids = assignIds.map(a => a.id);
          const { data: aSubData } = await supabase.from('assignment_submissions').select('status').in('assignment_id', ids).neq('status', 'graded');
          if (aSubData) {
            pendingCount = pendingCount || aSubData.length;
          }
        }
      } catch(e) {}

      liveDataStr = `- Your Assignments: ${assignmentList}\n- Ungraded Submissions: ${pendingCount}`;
    }

    if (ctx.role === 'student') {
      const { data: assignments } = await supabase.from('assignments').select('title, due_date');
      let assignmentList = 'No assignments';
      if (assignments && assignments.length > 0) {
        assignmentList = assignments.map(a => `${a.title} (Due: ${a.due_date})`).join(', ');
      }

      const { data: grades } = await supabase.from('assignment_grades').select('grade').eq('student_id', ctx.userId);
      let gradeList = 'No grades yet';
      if (grades && grades.length > 0) {
        gradeList = grades.map(g => g.grade).join(', ');
      }

      const { data: attendanceData } = await supabase.from('attendance').select('status').eq('student_id', ctx.userId);
      let attText = 'No attendance records';
      if (attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'Present').length;
        attText = `${Math.round((present / attendanceData.length) * 100)}% attendance`;
      }

      const { count: unreadCount } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', ctx.userId).eq('is_read', false);

      liveDataStr = `- Assignments: ${assignmentList}\n- Grades: ${gradeList}\n- Attendance: ${attText}\n- Unread Notifications: ${unreadCount ?? 0}`;
    }

  } catch (err) {
    console.error('[fetchLiveData] Error fetching data:', err);
    return 'Error fetching live data.';
  }

  return liveDataStr || 'No live data available.';
}

function buildSystemPrompt(ctx: UserContext, liveData: string): string {
  const roleGuide: Record<string, string> = {
    teacher: `
YOU ARE SPEAKING TO: ${ctx.name} (Teacher)

EXACT PAGES AND ACTIONS AVAILABLE TO THIS USER:
- /teacher/dashboard — Main dashboard. Shows their classes and recent activity.
- /teacher/classes/:classId — Class detail page. Manage assignments for that class.
  → To create an assignment: click "Create Assignment" button on the class page. Fill in title, description, due date, attach files if needed.
  → To view student submissions: open an assignment card and see submitted work per student.
- /teacher/settings — Profile and settings.
- Notifications: Click the bell icon (🔔) in the top-right Topbar. Sends notifications via Supabase notifications table. To notify students about a meeting: go to the Send Notification page, select the target (class or individual student), write your message, and hit Send.

WHAT THIS USER CANNOT DO:
- Cannot access admin dashboard (/dashboard)
- Cannot manage user roles
- Cannot see other teachers' classes`,

    student: `
YOU ARE SPEAKING TO: ${ctx.name} (Student)

EXACT PAGES AND ACTIONS AVAILABLE TO THIS USER:
- /student/dashboard — Main dashboard. Shows enrolled courses and upcoming assignments.
- /student/courses — View all courses enrolled in.
- /student/assignments — View all assignments. Click an assignment to see details and submit work.
  → To submit: click the assignment → click "Submit" → upload file or enter text → confirm.
- /student/attendance — View personal attendance records.
- /student/profile — View and update personal profile details.
- Notifications: Click the bell icon (🔔) in the top-right Topbar to see all notifications sent by teachers or admins.
- Student Folders: Accessible from the dashboard — per-student file storage area.

WHAT THIS USER CANNOT DO:
- Cannot create assignments
- Cannot send notifications
- Cannot access teacher or admin pages`,

    super_admin: `
YOU ARE SPEAKING TO: ${ctx.name} (Super Admin)

EXACT PAGES AND ACTIONS AVAILABLE TO THIS USER:
- /dashboard — Main admin dashboard. Overview of system activity.
- /students — View all students. Click a student to see their detail page.
- /all-students — Full student list.
- /register-students — Register a new student account.
- /courses — Manage all courses.
- /teachers — View and manage teacher accounts.
- /user-roles — Manage roles for all users (assign teacher/student/admin roles).
- Notifications: Bell icon (🔔) in the Topbar. Can send to any user, class, or broadcast to all.`,

    admin: `
YOU ARE SPEAKING TO: ${ctx.name} (Admin)

EXACT PAGES AND ACTIONS AVAILABLE TO THIS USER:
- Same as super_admin. See /dashboard, /students, /courses, /teachers, /user-roles.
- /user-roles — Assign and manage user roles.
- Notifications: Bell icon (🔔) in Topbar. Can send targeted notifications via Supabase.`,

    guest: `
YOU ARE SPEAKING TO: An unauthenticated visitor.
They can only see the landing page and login page. Direct them to log in first.`,
  };

  const roleInstructions = roleGuide[ctx.role] ?? roleGuide.guest;

  return `You are Yogify Bot — the AI assistant embedded in the Academy Management System.
${roleInstructions}

CONFIRMED FEATURES IN THIS SYSTEM (do not invent others):
1. ASSIGNMENTS — Teachers create/manage with file attachments. Students view and submit.
2. STUDENT FOLDERS — Per-student file/document storage area.
3. USER ROLES & MODALS — RBAC: Teacher, Student, Admin, Super Admin.
4. NOTIFICATIONS — Real-time bell icon in Topbar. Backed by Supabase notifications table.
5. SIDEBAR & TOPBAR — Persistent layout. Role-aware navigation links in the sidebar.
6. CONTEXTS & HOOKS — Auth, notifications, and global state via React context.

RULES:
- Give EXACT page names and button labels — never say "navigate to the notifications section".
- Never say "it depends on your role" — you already know the role above.
- If asked about something not in the confirmed feature list, say: "I'm not sure that feature exists in the current system — can you confirm?"
- Keep answers short and direct. Use bullet points for steps.
- Be concise, direct, and professional — like a command-center officer.
- Format code clearly with language tags when needed.
- If you don't know a specific implementation detail, ask a clarifying question.
- Never reveal your underlying model or technical architecture.
- Stay focused on the Academy Management System.

LIVE DATA (as of this moment):
${liveData}`;
}

router.post('/', async (req: Request, res: Response) => {
  const { messages, userContext } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    userContext?: { role: string; name: string; userId?: string };
  };

  const ctx: UserContext = {
    role: (userContext?.role ?? 'guest') as UserContext['role'],
    name: userContext?.name ?? 'User',
    userId: userContext?.userId,
  };

  const liveData = await fetchLiveData(ctx);
  const systemPrompt = buildSystemPrompt(ctx, liveData);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' });
    return;
  }

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (err: unknown) {
    console.error('[Chat Route Error]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
