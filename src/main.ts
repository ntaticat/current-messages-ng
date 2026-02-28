import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // 1. Enrutamiento moderno
    provideRouter(routes),

    // 2. HTTP con interceptores funcionales (más rápido que DI)
    provideHttpClient(withInterceptors([authInterceptor])),

    // 3. Animaciones sin necesidad de cargar todo el módulo
    // provideAnimations(),
  ],
}).catch((err) => console.error(err));
