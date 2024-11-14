import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { authService } from './authService';

export const adminGuard: CanActivateFn = (route, state) => {

  const authSvc: authService = inject(authService);
  const router = inject(Router);

  if (authSvc.isAdmin()) {
    return true;
  }
  router.navigate(['/']);
  return false;
};