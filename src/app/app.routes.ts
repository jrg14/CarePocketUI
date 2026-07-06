import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './features/users/data-services/users-auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/users/pages/auth-page/auth-page').then((m) => m.AuthPageComponent),
    data: { mode: 'login' },
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/users/pages/auth-page/auth-page').then((m) => m.AuthPageComponent),
    data: { mode: 'register' },
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/pages/dashboard-page/dashboard-page').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/landing/landing').then((m) => m.LandingComponent),
  },
];
