import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { ApiConfiguration } from '../api/api-configuration';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const config = inject(ApiConfiguration);
  const isApiRequest = req.url.startsWith(config.rootUrl);
  const request = isApiRequest ? req.clone({ withCredentials: true }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      // TODO: look into refactoring hardcoded error numbers into constants
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.invalidateCache();
      }

      return throwError(() => error);
    })
  );
};
