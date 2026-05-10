import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Only admin and super_admin can access these routes
router.use(requireRole(['admin', 'super_admin']));

/**
 * GET /users
 * Fetch all users
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /users
 * Create a new user
 */
router.post('/', async (req: Request, res: Response) => {
  const { email, name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Missing required fields: name, role' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name, role }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /users/:id
 * Update a user
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name, role } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ email, name, role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /users/:id
 * Delete a user
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
