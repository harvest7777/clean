# Auth Feature — Code Review

**Branch:** `auth-service`
**Reviewed:** 2026-05-01
**Depth:** deep (cross-file + backend CORS analysis)
**Reviewer:** Claude (adversarial review)

---

~~**C-01 — `AllowAnyOrigin()` + `withCredentials` (`Program.cs:28`)**~~
**RETRACTED — FALSE POSITIVE.** `proxy.conf.js` forwards all `/api` calls server-side from the Angular dev server, so the browser never makes a cross-origin request. In production, Angular is built and served from the same .NET origin via `UseFileServer()` + `MapFallbackToFile`. The CORS policy is unused for the app's own traffic. No functional issue exists.

---

## CRITICAL

### C-02: `checkAuth()` re-throws non-401 errors, but both guards have no `.catch` — backend outage blocks access to login page

**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/auth.guard.ts:10-14`
**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/guest-only.guard.ts:10-14`

**What the problem is:**
`AuthService.checkAuth()` deliberately re-throws any error that is not a 401:

```typescript
// auth.service.ts:46-47
throw e; // re-throws network errors, 500s, timeouts
```

Both guards call `checkAuth()` as a raw `.then()` with no `.catch()`. When `checkAuth()` throws (e.g., the backend is down, a 500 is returned, or there is a network timeout), the unhandled promise rejection propagates out of the `CanActivateFn`. Angular's router will swallow the rejection and the navigation will hang or silently fail — the user is stuck on the current page with no feedback and no retry path.

**Why it matters:**
Angular cancels (not hangs) a navigation when a guard's promise rejects — but with zero user feedback. More critically, `guestOnlyGuard` also wraps `/auth/login` and `/auth/register`. When the backend is unreachable, users cannot even reach the login page to attempt recovery. The app is completely inaccessible until the backend comes back.

**Exact steps to reproduce:**
1. Stop the .NET backend.
2. In the running Angular app, navigate to `/editor`.
3. `authGuard` calls `checkAuth()`, which calls `GET /api/Users/manage/info`.
4. The request fails (connection refused / network error).
5. `checkAuth()` throws (not a 401, so it re-throws at line 47 of `auth.service.ts`).
6. The guard's promise rejects without a catch handler.
7. Angular router receives a rejected promise from `CanActivateFn` — navigation hangs indefinitely with no error shown.

**Fix:**
Add error handling in each guard to redirect gracefully on unexpected errors:

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .checkAuth()
    .then((isAuthenticated) =>
      isAuthenticated ? true : router.parseUrl(AppRouteUrls.authLogin)
    )
    .catch(() => router.parseUrl(AppRouteUrls.authLogin)); // backend down → go to login
};
```

```typescript
// guest-only.guard.ts
export const guestOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .checkAuth()
    .then((isAuthenticated) =>
      isAuthenticated ? router.parseUrl(AppRouteUrls.authAlreadyAuthenticated) : true
    )
    .catch(() => true); // backend down → allow access to login/register
};
```

---

## HIGH

### H-01: `AuthService` exposes no auth state signal — violates architecture contract and causes redundant network calls

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/services/auth.service.ts`
**Lines:** 11–50

**What the problem is:**
`AuthService` has zero reactive state. `checkAuth()` always makes a live HTTP request. The CLAUDE.md architectural contract requires services to maintain `Signal<T>` for state that components need to consume reactively.

Concrete broken behaviors caused by this:

1. **Double network call on login:** `login.page.ts` calls `auth.login()` (line 26), then immediately calls `auth.checkAuth()` (line 28), firing a second HTTP request to `/manage/info` to verify a session that the successful `login()` response already established. The second call is a wasted round-trip and can race.

2. **No local state cleared on logout:** `logout()` resolves but sets nothing. If the logout API call throws, the service has no record that a logout was attempted, and local UI state is undefined. The `AlreadyAuthenticatedPageComponent` does navigate to login on success, but if any other component needs to react to logout (e.g., a nav bar showing user info), there is no signal to observe.

3. **Every guard navigation fires a network request:** Because `checkAuth()` has no cached result, every route change that hits a guard makes an HTTP round-trip. On a slow connection this creates visible navigation lag.

**Exact steps to reproduce (double call):**
1. Open DevTools Network tab, filter by XHR.
2. Submit the login form.
3. Observe two network requests fire in sequence: `POST /api/Users/login` then immediately `GET /api/Users/manage/info`.

**Fix:**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);

  private readonly _isAuthenticated = signal<boolean | null>(null);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(
      apiUsersLoginPost(this.http, this.config.rootUrl, {
        useCookies: true,
        body: { email, password },
      })
    );
    this._isAuthenticated.set(true);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(logout(this.http, this.config.rootUrl, { body: {} }));
    } finally {
      this._isAuthenticated.set(false); // clear local state even if server call fails
    }
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

Then remove the redundant `checkAuth()` call from `login.page.ts`:

```typescript
// login.page.ts onSubmit()
await this.auth.login(credentials.email, credentials.password);
// login() sets isAuthenticated = true — no need to re-verify
await this.router.navigateByUrl(this.routes.editor);
```

---

### H-02: `core/` guards import directly from `features/auth/` — architectural boundary violation

**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/auth.guard.ts:3`
**File:** `src/Web/angular-tiptap-editor/src/app/core/guards/guest-only.guard.ts:3`

**What the problem is:**
Both guards in `core/` import `AuthService` from `../../features/auth/services/auth.service`. The CLAUDE.md explicitly states:

> `core/` contains nothing that references a specific feature.

This creates a hard compile-time `core → features/auth` dependency. If the auth feature is ever restructured or renamed, the core module breaks. It also means `core/` is not actually feature-agnostic.

**Why it matters:**
The guard is a routing concern that should be stable. Coupling it to a feature-scoped service means changes to the feature tree can break the guard without the developer expecting it. This is the kind of layering violation that compounds over time.

**Exact steps to reproduce:**
Open `auth.guard.ts` and trace the import path: `../../features/auth/services/auth.service`. The guard lives in `core/`; the service lives in `features/`.

**Fix:**
Move `AuthService` into `core/auth/auth.service.ts`. It is cross-cutting infrastructure (session management, auth checks), not feature-specific UI logic. The auth feature's pages/components would import from `core/auth/auth.service` instead of from within `features/auth/`.

```
src/app/core/auth/auth.service.ts   ← move here
src/app/core/guards/auth.guard.ts   ← import from ../auth/auth.service
```

---

### H-03: Backend error strings rendered directly into the DOM — account enumeration and information disclosure

**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/login/login.page.ts:43`
**File:** `src/Web/angular-tiptap-editor/src/app/features/auth/pages/register/register.page.ts:33`

**What the problem is:**
Both `getErrorMessage()` implementations render `error.error?.detail ?? error.error?.title` directly. For ASP.NET Identity + ProblemDetails:

- On a duplicate email registration, `detail` will contain something like `"Username 'user@example.com' is already taken."` — this confirms to an attacker whether an email address is registered (account enumeration).
- On a failed login, the backend may return `"Failed"` or the raw Identity error code.
- In non-production builds, `detail` can include exception type names or stack trace fragments.

This is surfaced verbatim in the template via `{{ errorMessage() }}`.

**Exact steps to reproduce (account enumeration):**
1. Register with `attacker@example.com`.
2. Try to register again with the same email.
3. The error message in the UI will confirm that the account already exists.
4. An attacker can enumerate valid email addresses by attempting registration.

**Fix:**
Map HTTP status codes to user-safe strings. Never render server-provided `detail` or `title`:

```typescript
private getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 400: return 'Please check your details and try again.';
      case 401: return 'Incorrect email or password.';
      case 409: return 'An account with this email already exists.'; // if backend uses 409
      case 429: return 'Too many attempts. Please wait before trying again.';
      default:  return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
```

Also extract this into a single shared utility (`features/auth/utils/auth-errors.ts`) rather than duplicating it in both page components.

---

## Summary

| ID   | Severity | File                                      | Issue                                                                     |
|------|----------|-------------------------------------------|---------------------------------------------------------------------------|
| ~~C-01~~ | ~~CRITICAL~~ | ~~`src/Web/Program.cs:28`~~       | ~~RETRACTED — proxy + same-origin prod deploy, no actual CORS issue~~     |
| C-02 | CRITICAL | `core/guards/auth.guard.ts`, `guest-only` | Unhandled rejection from `checkAuth()` — backend outage blocks login page |
| H-01 | HIGH     | `features/auth/services/auth.service.ts`  | No auth state signal; redundant `checkAuth()` call after login            |
| H-02 | HIGH     | `core/guards/auth.guard.ts:3`             | `core/` imports from `features/` — boundary violation per CLAUDE.md      |
| H-03 | HIGH     | `login.page.ts:43`, `register.page.ts:33` | Raw server error strings rendered — account enumeration risk              |

**Top priority:** Fix C-02. A backend outage leaves users unable to reach the login page due to `guestOnlyGuard` throwing without a catch.

---

_Reviewed: 2026-05-01_
_Reviewer: Claude (adversarial review, deep depth)_
