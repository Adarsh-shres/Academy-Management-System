import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

const PROFILE_SELECT =
  'student_id, father_name, date_of_birth, mobile_no, gender, department, course, city, address, is_active, date_enrolled';

/**
 * GET /students/profiles?ids=uuid1,uuid2,...
 * Fetches student_profiles rows for the given student IDs.
 * Uses the service-role Supabase client (server-side) so RLS is bypassed.
 * No auth middleware — StudentContext calls this for all authenticated roles.
 */
router.get('/profiles', async (req: Request, res: Response) => {
  const rawIds = req.query.ids as string | undefined;

  if (!rawIds) {
    res.status(400).json({ error: 'Missing required query param: ids' });
    return;
  }

  const ids = rawIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    res.json([]);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select(PROFILE_SELECT)
      .in('student_id', ids);

    if (error) {
      console.error('[students/profiles] Supabase error:', error.message, '| code:', error.code);
      res.status(500).json({ error: 'Failed to fetch student profiles', detail: error.message });
      return;
    }

    res.status(200).json(data ?? []);
  } catch (err: any) {
    console.error('[students/profiles] Unexpected error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
