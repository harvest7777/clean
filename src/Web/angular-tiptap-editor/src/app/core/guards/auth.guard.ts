import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .checkAuth()
    .then((isAuthenticated) =>
      isAuthenticated ? true : router.createUrlTree(['/auth/login'])
    )
    .catch(() => router.createUrlTree(['/auth/login']));
};
