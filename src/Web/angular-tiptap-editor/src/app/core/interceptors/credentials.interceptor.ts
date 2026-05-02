import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiRequest = isSameOriginApiRequest(req.url);
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

function isSameOriginApiRequest(url: string): boolean {
  try {
    const resolvedUrl = new URL(url, window.location.origin);
    return (
      resolvedUrl.origin === window.location.origin &&
      resolvedUrl.pathname.startsWith('/api/')
    );
  } catch {
    return false;
  }
}
