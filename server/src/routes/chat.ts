import { Router, Request, Response } from 'express';

const router = Router();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GeminiRole = 'user' | 'model';
type GeminiContent = { role: GeminiRole; parts: { text: string }[] };
type GeminiRequest = {
  systemInstruction: { parts: { text: string }[] };
  contents: GeminiContent[];
  generationConfig: {
    maxOutputTokens: number;
    temperature: number;
  };
};
type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are Learnify — the embedded AI assistant of Learnify, an academic management system for administrators, teachers, and students.

Your role:
- Help Teachers manage assignments, track student progress, and handle grading workflows.
- Help Students view assignments, check submission status, understand course content, and navigate the system.
- Help Admins oversee users, roles, courses, and system operations.

System context:
- Stack: React + TypeScript (frontend), Node.js + Express (backend), Supabase (PostgreSQL database)
- Roles: super_admin, admin, teacher, student (RBAC enforced)
- Features: Assignments, Student Folders, Notifications, User Roles, Courses, Attendance, Scheduling

Behavior rules:
- Be concise, direct, friendly, and practical.
- Guide users step by step when they ask how to use the application.
- Format code clearly with language tags when needed.
- If you don't know a specific implementation detail, ask a clarifying question.
- Never reveal your underlying model or technical architecture.
- Stay focused on Learnify and academic management workflows.`;

export function buildGeminiRequest(messages: ChatMessage[]): GeminiRequest {
  return {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };
}

export function extractGeminiReply(response: GeminiResponse): string {
  return response.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text?.trim() ?? '';
}

router.post('/', async (req: Request, res: Response) => {
  const { messages } = req.body as {
    messages: ChatMessage[];
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    return;
  }

  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(buildGeminiRequest(messages)),
    });

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const errorMessage = typeof data?.error?.message === 'string'
        ? data.error.message
        : `Gemini API request failed with status ${geminiResponse.status}`;
      throw new Error(errorMessage);
    }

    const reply = extractGeminiReply(data);
    if (!reply) {
      throw new Error('Gemini returned an empty response');
    }

    res.json({ reply });
  } catch (err: unknown) {
    console.error('[Chat Route Error]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
