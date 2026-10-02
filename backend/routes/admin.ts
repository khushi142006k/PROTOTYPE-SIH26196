import { Router, Response } from 'express';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';
import { adminRateLimiter } from '../middleware/rateLimiter.ts';
import { supabaseAdmin } from '../lib/supabaseAdmin.ts';

const router = Router();

router.use(requireAdmin);
router.use(adminRateLimiter);

// Helper to log admin actions
async function logAction(adminId: string, action: string, targetType?: string, targetId?: string, details?: any) {
  try {
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ? JSON.stringify(details) : null
    });
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}

// 1. Fetch Paginated Users List
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string || '').trim().toLowerCase();
    const status = req.query.status as string;
    const role = req.query.role as string;

    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    res.json({
      success: true,
      users: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Suspend / Reactivate User
router.post('/users/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    await logAction(req.user.id, `USER_${status.toUpperCase()}`, 'profile', userId);

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Promote / Demote Admin
router.post('/users/:id/role', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { isAdmin, role } = req.body;

    const targetRole = role || (isAdmin ? 'admin' : 'user');
    const targetIsAdmin = isAdmin !== undefined ? isAdmin : (targetRole === 'admin');

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_admin: targetIsAdmin,
        role: targetRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    await logAction(req.user.id, `USER_ROLE_${targetRole.toUpperCase()}`, 'profile', userId);

    res.json({ success: true, message: 'User role updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Delete User Account
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // Delete from auth.users via service role
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      // Fallback: Delete profile directly if auth user is already gone
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
    }

    await logAction(req.user.id, 'USER_DELETED', 'profile', userId);

    res.json({ success: true, message: 'User account permanently deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. AI Usage Monitor
router.get('/ai-usage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ success: true, logs: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Update App Settings
router.post('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Setting key is required' });

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
        updated_by: req.user.id
      });

    if (error) throw error;

    await logAction(req.user.id, 'SETTING_UPDATE', 'app_settings', key, { value });

    res.json({ success: true, message: `Setting '${key}' updated` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Fetch Audit Logs
router.get('/logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_logs')
      .select('*, admin:profiles!admin_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ success: true, logs: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
