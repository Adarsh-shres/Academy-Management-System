import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * GET /notifications/:userId
 * Fetch latest 20 notifications for a specific user
 */
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /notifications/:id/read
 * Mark a specific notification as read
 */
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

/**
 * PATCH /notifications/user/:userId/read-all
 * Mark all notifications for a user as read
 */
router.patch('/user/:userId/read-all', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error.message);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

/**
 * POST /notifications
 * Create a new custom announcement/notification
 */
router.post('/', async (req: Request, res: Response) => {
  const { userId, title, message, type = 'announcement' } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields: userId, title, message' });
  }

  try {
    // If userId is an array (multiple recipients)
    if (Array.isArray(userId)) {
      const inserts = userId.map(id => ({
        user_id: id,
        title,
        message,
        type
      }));
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(inserts)
        .select();
        
      if (error) throw error;
      return res.status(201).json(data);
    }

    // Single recipient
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message, type }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating notification:', error.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;
