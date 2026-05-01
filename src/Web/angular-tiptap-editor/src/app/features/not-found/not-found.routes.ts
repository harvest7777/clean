import { Routes } from "@angular/router";
import { AppRoutePaths } from "../../core/routing/app-routes";
import { NotFoundPageComponent } from "./pages/not-found.page";

export const NOT_FOUND_ROUTES: Routes = [
  { path: AppRoutePaths.home, component: NotFoundPageComponent },
];
