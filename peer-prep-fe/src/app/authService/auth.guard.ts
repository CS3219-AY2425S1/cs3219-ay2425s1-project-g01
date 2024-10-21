import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { authService } from './authService';

export const authGuard: CanActivateFn = (route, state) => {

  const authSvc: authService = inject(authService);
  const router = inject(Router);

  if (authSvc.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};