import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "editor",
    loadChildren: () =>
      import("./features/text-editor/text-editor.routes").then(
        (m) => m.TEXT_EDITOR_ROUTES
      ),
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "",
    loadChildren: () =>
      import("./features/landing/landing.routes").then(
        (m) => m.LANDING_ROUTES
      ),
  },
];
