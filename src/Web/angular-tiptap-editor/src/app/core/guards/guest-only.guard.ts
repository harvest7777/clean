import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AppRouteUrls } from '../routing/app-routes';

export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getAuthStatus().then((status) => {
    switch (status.kind) {
      case 'authenticated':
        return router.parseUrl(AppRouteUrls.authAlreadyAuthenticated);
      case 'unauthenticated':
        return true;
      case 'unavailable':
        return router.parseUrl(AppRouteUrls.unavailable);
    }
  });
};
