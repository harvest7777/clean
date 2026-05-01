import { Routes } from "@angular/router";
import { AppRoutePaths } from "../../core/routing/app-routes";
import { LandingPageComponent } from "./pages/landing.page";

export const LANDING_ROUTES: Routes = [
  { path: AppRoutePaths.home, component: LandingPageComponent },
];
