import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AppRouteUrls } from '../routing/app-routes';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .checkAuth()
    .then((isAuthenticated) =>
      isAuthenticated ? true : router.parseUrl(AppRouteUrls.authLogin)
    )
    .catch(() => router.parseUrl(AppRouteUrls.authLogin));
};
