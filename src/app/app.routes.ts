import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', // URL raíz
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent)
  },
];