import { Routes } from "@angular/router";
import { guestGuard } from "../guards/guest.guard";
import { AppRoutePaths } from "../routing/app-routes";

export const AUTH_ROUTES: Routes = [
  {
    path: AppRoutePaths.login,
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPageComponent),
  },
  {
    path: AppRoutePaths.register,
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./pages/register/register.page").then(
        (m) => m.RegisterPageComponent
      ),
  },
  {
    path: AppRoutePaths.home,
    redirectTo: AppRoutePaths.login,
    pathMatch: "full",
  },
];
