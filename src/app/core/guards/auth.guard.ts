import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from 'src/app/data/services/auth.service';
import { SessionCryptoService } from 'src/app/data/services/session-crypto.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const sessionCrypto = inject(SessionCryptoService);

  const hasToken = !!authService.getToken();
  const hasPrivateKey = sessionCrypto.hasPrivateKey();

  if (hasToken && hasPrivateKey) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
