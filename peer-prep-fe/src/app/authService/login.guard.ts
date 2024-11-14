import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { authService } from './authService';

export const loginGuard: CanActivateFn = (route, state) => {

  const authSvc: authService = inject(authService);
  const router = inject(Router);
  const userData = sessionStorage.getItem("userData")

  if (userData !== null) {
    router.navigate(['/'])
    return false
  }
  return true
};