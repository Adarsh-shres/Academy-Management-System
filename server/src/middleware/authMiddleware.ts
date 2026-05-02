import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // For simplicity, we check the X-User-Role header.
    // In a production environment, this should verify the Supabase JWT.
    const userRole = req.headers['x-user-role'] as string;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized: Missing role header' });
    }

    // Treat super_admin and admin interchangeably for these routes
    const effectiveRole = userRole === 'super_admin' ? 'admin' : userRole;
    
    // Also expand allowedRoles
    const expandedAllowedRoles = allowedRoles.includes('admin') 
      ? [...allowedRoles, 'super_admin'] 
      : allowedRoles;

    if (!expandedAllowedRoles.includes(effectiveRole) && !expandedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
