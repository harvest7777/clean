/*
 * Route guard for protected pages.
 * It decides whether navigation may continue or should be redirected elsewhere.
 * It does not own login state itself; it asks the auth service for that information.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AppRouteUrls } from '../routing/app-routes';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getAuthStatus().then((status) => {
    switch (status.kind) {
      case 'authenticated':
        return true;
      case 'unauthenticated':
        return router.parseUrl(AppRouteUrls.authLogin);
      case 'unavailable':
        return router.parseUrl(AppRouteUrls.unavailable);
    }
  });
};
