import { Routes } from "@angular/router";
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
    path: AppRoutePaths.home,
    redirectTo: AppRoutePaths.login,
    pathMatch: "full",
  },
];
