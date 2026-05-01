# Angular Auth Implementation — Code Review

**Branch:** `auth-service`
**Reviewed:** 2026-05-01
**Depth:** deep (cross-file analysis)
**Files Reviewed:** 10 source files + interceptor

---
``
## CRITICAL

### [CRITICAL] Cookie auth is broken — `withCredentials` is never set on HTTP requests

**File:** `src/Web/angular-tiptap-editor/src/main.ts:13`
**Issue:** `provideHttpClient()` is called with no interceptors, and no interceptor in this app sets `withCredentials: true`. The `authorize.interceptor.ts` that clones requests with `withCredentials` lives in the legacy `ClientApp` project and is **not registered** in the `angular-tiptap-editor` app. The generated `RequestBuilder.build()` also does not set `withCredentials`. The result: every auth-related HTTP request (`login`, `logout`, `manage/info`) is sent without credentials, so cookies are never attached and the cookie-based session will never work in cross-origin environments (dev server proxies may mask this locally, but it will fail in staging/production).
**Fix:** Register a functional interceptor that adds `withCredentials: true` to every request, or use Angular's built-in `withXsrfProtection()`:

```typescript
// core/interceptors/credentials.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
```

```typescript
// main.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './app/core/interceptors/credentials.interceptor';

provideHttpClient(withInterceptors([credentialsInterceptor])),
```

---

### [CRITICAL] Auth guard swallows non-401 errors and silently redirects to login

**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/auth.guard.ts:15`
**Issue:** The `.catch(() => router.parseUrl(AppRouteUrls.authLogin))` catch block handles **all** errors thrown by `checkAuth()` — including network failures, server 500s, and timeouts — by silently redirecting the user to the login page. This means a transient backend outage will log out every authenticated user without any warning or retry. `AuthService.checkAuth()` already re-throws non-401 errors, so the guard's catch block should propagate them instead of hiding them.
**Fix:**
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .checkAuth()
    .then((isAuthenticated) =>
      isAuthenticated ? true : router.parseUrl(AppRouteUrls.authLogin)
    );
  // Let non-401 errors propagate — Angular's error handler will catch them.
  // Do NOT catch here; AuthService already filters non-401 into a throw.
};
```

---

### [CRITICAL] `AuthorizeInterceptor` in `ClientApp` uses class-based pattern and constructor injection — incompatible with the new app

**File:** `src/Web/ClientApp/src/api-authorization/authorize.interceptor.ts:10-11`
**Issue:** This interceptor uses the deprecated `HttpInterceptor` class interface and constructor injection (`constructor(private router: Router)`), both of which are explicitly banned by the project's CLAUDE.md conventions and are incompatible with how `provideHttpClient(withInterceptors([...]))` expects functional interceptors. Even if someone attempts to register it, it would require the old `HTTP_INTERCEPTORS` token, which is not wired up. Additionally, the redirect check at line 20 uses `!this.router.url.startsWith('/login')` — a hardcoded path that doesn't match the actual auth route `/auth/login`, so the duplicate-redirect guard is always ineffective.
**Fix:** This file belongs to the old app and should not be adapted or reused. Write a new functional interceptor in `angular-tiptap-editor/src/app/core/interceptors/` as shown in the finding above.

---

## HIGH

### [HIGH] Redundant `checkAuth()` network call immediately after `login()`

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/login/login.page.ts:28`
**Issue:** After `await this.auth.login(...)` succeeds (line 26), the page immediately calls `await this.auth.checkAuth()` (line 28), which makes a second HTTP request to `/api/Users/manage/info`. If `login()` returns without throwing, the server has issued the session cookie and the auth is established. The extra `checkAuth()` call adds a round trip, is semantically redundant, and can fail for reasons unrelated to authentication validity (e.g., a race on the backend). The message shown on failure ("Signed in but your session could not be verified") will confuse users because they are actually authenticated.
**Fix:** Remove the post-login `checkAuth()` call and navigate directly:

```typescript
async onSubmit(credentials: { email: string; password: string }): Promise<void> {
  this.isLoading.set(true);
  this.errorMessage.set(null);

  try {
    await this.auth.login(credentials.email, credentials.password);
    await this.router.navigateByUrl(this.routes.editor);
  } catch (e) {
    this.errorMessage.set(this.getErrorMessage(e));
  } finally {
    this.isLoading.set(false);
  }
}
```

---

### [HIGH] No redirect for already-authenticated users visiting `/auth/login` or `/auth/register`

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/auth.routes.ts`
**Issue:** The auth routes have no guard to redirect already-authenticated users away. A logged-in user navigating to `/auth/login` will see the login form and can submit it again, potentially replacing their session with one for a different account. This is a poor UX and can cause confusing state.
**Fix:** Create an `unauthGuard` (inverse of `authGuard`) and apply it to the auth routes:

```typescript
// core/guards/unauth.guard.ts
export const unauthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.checkAuth().then((isAuth) =>
    isAuth ? router.parseUrl(AppRouteUrls.editor) : true
  );
};
```

```typescript
// auth.routes.ts
{ path: AppRoutePaths.login, canActivate: [unauthGuard], loadComponent: ... }
```

---

### [HIGH] `AuthService` has no state — auth status is unknown between guard checks

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/services/auth.service.ts`
**Issue:** `AuthService` exposes no signal for the current authentication state. Every consumer that needs to know "is the user logged in?" must call `checkAuth()`, which always issues a network request. This violates the project's signal-based state architecture (CLAUDE.md mandates signals for all UI state). Consequences: the guard re-checks auth on every navigation, there is no way for other parts of the app to reactively respond to auth state changes, and `logout()` leaves auth state undefined without clearing anything in the service.
**Fix:** Add a private `WritableSignal` for auth state, expose it as readonly, and update it inside `login()`, `logout()`, and `checkAuth()`:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAuthenticated = signal<boolean | null>(null); // null = unknown
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(apiUsersLoginPost(...));
    this._isAuthenticated.set(true);
  }

  async logout(): Promise<void> {
    await firstValueFrom(logout(...));
    this._isAuthenticated.set(false);
  }

  async checkAuth(): Promise<boolean> {
    try {
      await firstValueFrom(apiUsersManageInfoGet(this.http, this.config.rootUrl));
      this._isAuthenticated.set(true);
      return true;
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        this._isAuthenticated.set(false);
        return false;
      }
      throw e;
    }
  }
}
```

---

### [HIGH] `logout()` has no error handling and no post-logout navigation

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/services/auth.service.ts:32-34`
**Issue:** `logout()` is a fire-and-forget async method with no error handling and no navigation. If the logout API call fails (network error, 5xx), the caller receives a rejected promise and the user's session may remain active on the server while the UI is in an undefined state. There is also no code that navigates the user to `/auth/login` after logout — any UI that calls `logout()` must implement navigation independently, which creates inconsistency risk.
**Fix:** Handle errors in `logout()` and either navigate from the service or expose a clear post-logout contract:

```typescript
async logout(): Promise<void> {
  try {
    await firstValueFrom(logout(this.http, this.config.rootUrl, { body: {} }));
  } finally {
    // Always clear local auth state regardless of server response
    this._isAuthenticated.set(false);
  }
}
```

Navigation should remain in the calling component, but callers must handle the rejected promise rather than letting it propagate silently.

---

### [HIGH] `core/` guard imports directly from a feature service — violates architecture boundary

**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/auth.guard.ts:3`
**Issue:** `auth.guard.ts` is in `core/`, which the CLAUDE.md explicitly defines as "strictly feature-agnostic." The guard imports `AuthService` from `../../features/auth/services/auth.service`, creating a direct `core → feature` dependency. This breaks the layering rule and means `core/` now has a compile-time dependency on `features/auth/`.
**Fix:** Either move `AuthService` into `core/` (it is cross-cutting auth infrastructure, not feature-specific UI logic), or expose auth state through a `core`-level token/interface that `AuthService` satisfies. The simplest correct fix is to move the service:

```
src/app/core/auth/auth.service.ts   ← move here
src/app/core/guards/auth.guard.ts   ← import from ../auth/auth.service
```

---

## MEDIUM

### [MEDIUM] Error messages from the server are exposed directly to the UI

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/login/login.page.ts:43`
**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/register/register.page.ts:33`
**Issue:** `error.error?.detail ?? error.error?.title` renders raw server-provided strings in the DOM. For a .NET backend using ProblemDetails, `detail` can include stack trace summaries, internal type names, or database error messages in non-production environments. Even in production, backend validation messages (e.g., "DuplicateUserName") can leak information about user existence (account enumeration).
**Fix:** Map known HTTP status codes to user-safe messages, and reject all other server strings:

```typescript
private getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 400: return 'Invalid credentials. Please check your email and password.';
      case 401: return 'Incorrect email or password.';
      case 429: return 'Too many attempts. Please wait before trying again.';
      default:  return 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred.';
}
```

---

### [MEDIUM] `getErrorMessage` is duplicated identically in `login.page.ts` and `register.page.ts`

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/login/login.page.ts:41-47`
**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/register/register.page.ts:33-39`
**Issue:** Exact same private method in both files. Any fix to error messaging must be applied in two places.
**Fix:** Extract to a shared utility function in `features/auth/utils/auth-errors.ts` (or into `AuthService` itself if error classification belongs to the service layer).

---

### [MEDIUM] `register-form` and `login-form` forms are not reset after successful submit or on `isSuccess`

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/components/register-form/register-form.component.ts`
**Issue:** After a successful registration, `isSuccess` becomes true and the form disappears from the DOM (via `@else`), but the form's internal state is not reset. If `isSuccess` were ever set back to false (e.g., a future "register another account" flow), the old email/password values would be visible and the form would still be in touched state showing validation feedback.
**Fix:** Emit a `reset` or `success` output event from the page to the form, or reset the form on success inside `onSubmit()`:

```typescript
onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.submitted.emit(this.form.getRawValue());
  this.form.reset(); // reset immediately after emit
}
```

---

### [MEDIUM] No password strength validation on registration

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/components/register-form/register-form.component.ts:24-26`
**Issue:** The password field only validates `Validators.required`. ASP.NET Identity by default requires minimum 6 characters, at least one non-alphanumeric, one digit, and one uppercase letter. The frontend will happily allow submission of `"a"` as a password, which the backend will reject with a 400. The user gets no proactive guidance.
**Fix:** Add `Validators.minLength(6)` at minimum, and ideally a pattern validator that matches the backend's Identity password requirements. Show inline validation messages in the template.

---

### [MEDIUM] `auth.routes.ts` contains an empty-path redirect within a child router outlet — will never match

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/auth.routes.ts:18-21`
**Issue:** The `auth` feature is lazy-loaded under the `auth` path segment. Inside `AUTH_ROUTES`, there is a route with `path: AppRoutePaths.home` (which is `''`) that redirects to `AppRoutePaths.login` (which is `'login'`). In practice, navigating to `/auth` will match this empty-path route and redirect to `/auth/login`, which seems intentional — but the behavior depends on whether `pathMatch: 'full'` is applied correctly (it is, via `pathMatch: "full"`). This is functionally correct but the use of `AppRoutePaths.home` (semantically "the home/root route") to mean "the empty segment inside the auth feature" is misleading. It is the same constant used for the app root.
**Fix:** Use an explicit `''` string literal here rather than `AppRoutePaths.home` to avoid implying a semantic connection to the application's actual home route:

```typescript
{ path: '', redirectTo: AppRoutePaths.login, pathMatch: 'full' },
```

---

### [MEDIUM] `provideApiConfiguration` uses `var` and mutates the object after construction

**File:** `src/Web/angular-tiptap-editor/src/app/core/api/api-configuration.ts:10`
**Issue:** Although this is generated code, the pattern `var config = new ApiConfiguration(); config.rootUrl = rootUrl;` uses `var` (banned by modern TypeScript/ESLint conventions) and mutates the object post-construction. Minor, but inconsistent with the rest of the codebase which uses `const`.
**Fix:** Since this is generated code (`/* Code generated by ng-openapi-gen DO NOT EDIT. */`), do not edit it directly. Add a generator config or template override if the generator needs to be re-run. If the generator cannot be overridden, leave a lint-disable comment rather than making an edit that will be overwritten.

---

## LOW

### [LOW] `AppRouteUrls.home` is defined but never used defensively

**File:** `src/Web/angular-tiptap-editor/src/app/core/routing/app-routes.ts:11`
**Issue:** `AppRouteUrls.home` resolves to `'/'` but no navigation in the app redirects to `/`. Login redirects to `/editor`, register shows a success message. The constant exists but has no consumer, meaning any future use is unguarded.
**Fix:** No immediate fix required, but consider removing unused constants or adding a lint rule for unused exports.

---

### [LOW] `isLoading` and `errorMessage` signals on page components are not `protected`

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/login/login.page.ts:18-19`
**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/register/register.page.ts:14-16`
**Issue:** `isLoading`, `isSuccess`, and `errorMessage` signals are declared `readonly` but not `protected`. They are template-bound and should be `protected readonly` to prevent external access (they are not part of any public API).
**Fix:**
```typescript
protected readonly isLoading = signal(false);
protected readonly errorMessage = signal<string | null>(null);
```

---

### [LOW] No `returnUrl` preservation when the auth guard redirects to login

**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/auth.guard.ts:13`
**Issue:** When an unauthenticated user is redirected to `/auth/login`, the URL they originally requested is discarded. After logging in, they are always sent to `/editor`. This is acceptable for a single-route app but worth noting as a UX limitation.
**Fix:** Pass the original URL as a query parameter and consume it on login:

```typescript
// In guard:
const tree = router.parseUrl(AppRouteUrls.authLogin);
tree.queryParams = { returnUrl: router.url };
return tree;

// In login page onSubmit():
const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? this.routes.editor;
await this.router.navigateByUrl(returnUrl);
```

---

## Summary

### Overall Assessment

The auth flow has a **critical functional defect that will break the entire authentication mechanism in any real deployment**: cookies are never sent on HTTP requests because `withCredentials: true` is not set anywhere in the `angular-tiptap-editor` app. The `authorize.interceptor.ts` in `ClientApp` is a dead artifact from the legacy project and is both unregistered and incompatible with the new app's architecture. This alone means auth does not work end-to-end.

Beyond that, the auth guard masks backend errors (network outages silently log users out), `AuthService` has no reactive state signal (violating the project's core architecture pattern), and backend error messages are surfaced directly to the UI (information disclosure risk).

The component architecture is otherwise clean: smart/dumb separation is respected, Angular modern syntax (`@if`, `inject()`, `input()`, `output()`, functional guards) is used correctly, and there are no NgModules or BehaviorSubjects.

### Top 3 Priorities

1. **CRITICAL — Add a `withCredentials` interceptor.** Without this, cookie-based auth does not function across origins. Register a functional `credentialsInterceptor` via `provideHttpClient(withInterceptors([credentialsInterceptor]))` in `main.ts`.

2. **HIGH — Add auth state to `AuthService` as a signal.** The service should maintain a `WritableSignal<boolean | null>` for auth state, updated by `login()`, `logout()`, and `checkAuth()`. This satisfies the architectural contract, eliminates redundant network calls, and gives `logout()` a place to clear local state on server failure.

3. **HIGH — Fix the auth guard's catch block.** Replace `.catch(() => router.parseUrl(...))` with no catch at all (let non-401 errors propagate), since `AuthService.checkAuth()` already handles the 401 case and re-throws everything else.
