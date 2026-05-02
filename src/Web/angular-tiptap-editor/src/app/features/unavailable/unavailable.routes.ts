import { Routes } from '@angular/router';
import { AppRoutePaths } from '../../core/routing/app-routes';
import { UnavailablePageComponent } from './pages/unavailable.page';

export const UNAVAILABLE_ROUTES: Routes = [
  { path: AppRoutePaths.home, component: UnavailablePageComponent },
];
