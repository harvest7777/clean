import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { AppRoutePaths } from "./core/routing/app-routes";

export const routes: Routes = [
  {
    path: AppRoutePaths.editor,
    canActivate: [authGuard],
    loadChildren: () =>
      import("./features/text-editor/text-editor.routes").then(
        (m) => m.TEXT_EDITOR_ROUTES
      ),
  },
  {
    path: AppRoutePaths.auth,
    loadChildren: () =>
      import("./core/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: AppRoutePaths.home,
    loadChildren: () =>
      import("./features/landing/landing.routes").then(
        (m) => m.LANDING_ROUTES
      ),
  },
  {
    path: AppRoutePaths.unavailable,
    loadChildren: () =>
      import('./features/unavailable/unavailable.routes').then(
        (m) => m.UNAVAILABLE_ROUTES
      ),
  },
  {
    path: AppRoutePaths.notFound,
    loadChildren: () =>
      import("./features/not-found/not-found.routes").then(
        (m) => m.NOT_FOUND_ROUTES
      ),
  },
];
