import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'chats',
    // Cargamos el archivo de rutas completo
    loadChildren: () =>
      import('./modules/chats/chats.routes').then((m) => m.CHATS_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];
