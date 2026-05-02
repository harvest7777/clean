import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { AppRouteUrls } from '../routing/app-routes';

/*
 * Route guard for guest-only pages such as login and registration.
 * Authenticated users are redirected into the app, while auth service
 * failures route to the unavailable page instead of showing auth screens.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getAuthStatus().then((status) => {
    switch (status.kind) {
      case 'authenticated':
        return router.parseUrl(AppRouteUrls.home);
      case 'unauthenticated':
        return true;
      case 'unavailable':
        return router.parseUrl(AppRouteUrls.unavailable);
    }
  });
};
