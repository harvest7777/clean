import { Routes } from "@angular/router";
import { authGuard } from "../../core/guards/auth.guard";
import { AppRoutePaths } from "../../core/routing/app-routes";

export const AUTH_ROUTES: Routes = [
  {
    path: AppRoutePaths.login,
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPageComponent),
  },
  {
    path: AppRoutePaths.register,
    loadComponent: () =>
      import("./pages/register/register.page").then(
        (m) => m.RegisterPageComponent
      ),
  },
  {
    path: AppRoutePaths.alreadyAuthenticated,
    canActivate: [authGuard],
    loadComponent: () =>
      import("./pages/already-authenticated/already-authenticated.page").then(
        (m) => m.AlreadyAuthenticatedPageComponent
      ),
  },
  {
    path: AppRoutePaths.home,
    redirectTo: AppRoutePaths.login,
    pathMatch: "full",
  },
];
