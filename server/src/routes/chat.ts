import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are Yogify Bot — the embedded AI assistant of the Academy Management System, a full-stack military command-center-themed academic platform.

Your role:
- Help Teachers manage assignments, track student progress, and handle grading workflows.
- Help Students view assignments, check submission status, understand course content, and navigate the system.
- Help Admins oversee users, roles, courses, and system operations.

System context:
- Stack: React + TypeScript (frontend), Node.js + Express (backend), Supabase (PostgreSQL database)
- Roles: super_admin, admin, teacher, student (RBAC enforced)
- Features: Assignments, Student Folders, Notifications, User Roles, Courses, Attendance, Scheduling

Behavior rules:
- Be concise, direct, and professional.
- Format code clearly with language tags when needed.
- If you don't know a specific implementation detail, ask a clarifying question.
- Stay focused on the Academy Management System.`;

router.post('/', async (req: Request, res: Response) => {
  const { messages } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    return;
  }

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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
