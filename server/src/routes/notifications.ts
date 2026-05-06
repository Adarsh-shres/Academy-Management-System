import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// GET /notifications/:userId
// Fetch latest 30 notifications for a specific user
// ────────────────────────────────────────────────────────────────────────────
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  // ── Primary query: try with teacher_id column (post-migration schema) ──
  let data: any[] | null = null;
  let queryError: any = null;

  const result = await supabase
    .from('notifications')
    .select('id, user_id, teacher_id, title, message, type, is_read, created_at, class_id')
    .or(`user_id.eq.${userId},teacher_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(30);

  if (result.error) {
    // Log the full Supabase error for diagnosis
    console.error('[notifications GET] Supabase error:', JSON.stringify(result.error));

    // ── Fallback: teacher_id column may not exist yet — query user_id only ──
    const fallback = await supabase
      .from('notifications')
      .select('id, user_id, title, message, type, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (fallback.error) {
      console.error('[notifications GET] Fallback also failed:', JSON.stringify(fallback.error));
      queryError = fallback.error;
    } else {
      data = fallback.data;
    }
  } else {
    data = result.data;
  }

  if (queryError) {
    res.status(500).json({ error: 'Failed to fetch notifications', detail: queryError.message });
    return;
  }

  // Normalise rows: map teacher_id→user_id if user_id is null (legacy rows)
  const normalised = (data || []).map((n: any) => ({
    id: n.id,
    user_id: n.user_id ?? n.teacher_id ?? userId,
    title: n.title ?? 'Notification',
    message: n.message,
    type: n.type ?? 'announcement',
    is_read: n.is_read ?? false,
    created_at: n.created_at,
  }));

  res.status(200).json(normalised);
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /notifications/:id/read
// Mark a specific notification as read
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating notification:', error.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /notifications/user/:userId/read-all
// Mark all notifications for a user as read
// ────────────────────────────────────────────────────────────────────────────
router.patch('/user/:userId/read-all', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`user_id.eq.${userId},teacher_id.eq.${userId}`)
      .eq('is_read', false);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error.message);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /notifications
// Send a notification to one or more users
//
// Body:
//   title    string  – notification heading
//   message  string  – notification body
//   type     string  – 'announcement' | 'content' | 'update' (default: 'announcement')
//   target   string  – 'general' | 'student' | 'teacher' | 'class' | 'individual'
//   classId  string? – required when target === 'class'
//   userId   string | string[]? – required when target === 'individual'
// ────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const {
    userId,
    title = 'Notification',
    message,
    type = 'announcement',
    target = 'individual',
    classId,
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing required field: message' });
  }

  try {
    let userIdsToNotify: string[] = [];

    if (target === 'general') {
      // All users
      const { data: users, error } = await supabase.from('users').select('id');
      if (error) throw error;
      userIdsToNotify = users.map((u: any) => u.id);

    } else if (target === 'teacher') {
      // All teachers
      const { data: teachers, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'teacher');
      if (error) throw error;
      userIdsToNotify = teachers.map((u: any) => u.id);

    } else if (target === 'student') {
      // All students
      const { data: students, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'student');
      if (error) throw error;
      userIdsToNotify = students.map((u: any) => u.id);

    } else if (target === 'class') {
      if (!classId) {
        return res.status(400).json({ error: 'Missing required field: classId for class target' });
      }
      // All students enrolled in the course
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', classId);
      if (error) throw error;
      userIdsToNotify = enrollments.map((e: any) => e.student_id);

    } else {
      // Individual target
      if (!userId) {
        return res.status(400).json({ error: 'Missing required field: userId for individual target' });
      }
      userIdsToNotify = Array.isArray(userId) ? userId : [userId];
    }

    if (userIdsToNotify.length === 0) {
      return res.status(200).json({ success: true, message: 'No users found to notify', count: 0 });
    }

    const inserts = userIdsToNotify.map((id: string) => ({
      user_id: id,
      title,
      message,
      type,
      is_read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(inserts)
      .select();

    if (error) throw error;
    return res.status(201).json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error('Error creating notification:', error.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;
