import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Usamos inject() en lugar del constructor
  const token = localStorage.getItem('conejito-messages-jwt');

  // Lógica de exclusión (Login / Register)
  const isAuthPath =
    req.url.includes('Auth/login') ||
    (req.url.includes('Auth/register') && req.method === 'POST');

  if (isAuthPath) {
    return next(req);
  }

  // Clonar e insertar token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        authorization: `Bearer ${token}`,
      },
    });
  }

  // Manejo de errores 401
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('conejito-messages-jwt');
        console.error('AuthInterceptor: Error 401');
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => err);
    }),
  );
};
