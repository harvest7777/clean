import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.page").then((m) => m.LoginPageComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/register/register.page").then(
        (m) => m.RegisterPageComponent
      ),
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
];
