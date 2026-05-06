import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /students
// Returns all student users joined with their student_profiles.
// Uses the service role client — bypasses RLS entirely.
// No auth middleware on this route since the service key is server-only.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  // 1. Fetch all users with role = student
  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('role', 'student')
    .order('name', { ascending: true });

  if (userError) {
    console.error('[GET /students] Failed to fetch student users:', userError.message);
    res.status(500).json({ error: 'Failed to fetch students', detail: userError.message });
    return;
  }

  const studentRows = userRows ?? [];

  if (studentRows.length === 0) {
    res.status(200).json([]);
    return;
  }

  // 2. Fetch student_profiles for all student ids (service role bypasses RLS)
  const studentIds = studentRows.map((s: any) => s.id);

  const { data: profileRows, error: profileError } = await supabase
    .from('student_profiles')
    .select(
      'student_id, father_name, date_of_birth, mobile_no, gender, department, course, city, address, is_active, date_enrolled',
    )
    .in('student_id', studentIds);

  if (profileError) {
    // Log the exact error but still return student users without profiles
    console.error('[GET /students] Failed to fetch profiles:', profileError.message, '| code:', profileError.code);
  }

  // 3. Build a profile map for O(1) lookups
  const profileMap = new Map<string, any>(
    (profileRows ?? []).map((p: any) => [p.student_id, p]),
  );

  // 4. Join users with profiles and return
  const joined = studentRows.map((user: any) => {
    const profile = profileMap.get(user.id) ?? null;
    return { user, profile };
  });

  res.status(200).json(joined);
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /students/:id/profile
// Upsert a student_profiles row.
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  const profileData = req.body;

  const { error } = await supabase
    .from('student_profiles')
    .upsert({ ...profileData, student_id: id }, { onConflict: 'student_id' });

  if (error) {
    console.error('[PUT /students/:id/profile] Error:', error.message);
    res.status(500).json({ error: 'Failed to upsert student profile', detail: error.message });
    return;
  }

  res.status(200).json({ success: true });
});

export default router;
