import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Blocks protected tenant routes for anonymous users, and keeps super admins out of the tenant app. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);
  if (user.isSuperAdmin) return router.createUrlTree(['/admin/dashboard']);
  return true;
};

/** Keeps already-authenticated users out of /login, /signup, etc., sending them to the right home. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return true;
  return router.createUrlTree([user.isSuperAdmin ? '/admin/dashboard' : '/dashboard']);
};

/** Blocks the Super Admin portal for anyone but a super admin. */
export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);
  if (!user.isSuperAdmin) return router.createUrlTree(['/dashboard']);
  return true;
};
