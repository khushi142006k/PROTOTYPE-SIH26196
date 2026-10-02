import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.ts';

export interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
  token?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1].trim();
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing token' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Token verification failed' });
    }

    // Load user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && profile.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Forbidden: Account has been suspended' });
    }

    req.user = user;
    req.profile = profile || { id: user.id, email: user.email, name: user.user_metadata?.name || 'User', is_admin: false };
    req.token = token;
    next();
  } catch (err: any) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ success: false, error: 'Unauthorized: Internal authentication error' });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (!req.profile?.is_admin && req.profile?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden: Administrative privileges required' });
    }
    next();
  });
}
