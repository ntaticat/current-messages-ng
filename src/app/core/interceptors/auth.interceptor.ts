import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, from, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (
      req.url.includes('Auth/login') ||
      (req.url.includes('Auth/register') && req.method == 'POST')
    ) {
      return next.handle(req).pipe(finalize(() => null));
    }

    const token = localStorage.getItem('conejito-messages-jwt');

    if (token) {
      req = req.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      finalize(() => null),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          localStorage.removeItem('conejito-messages-jwt');
          console.error('AuthInterceptor: Error 401');
          this.router.navigateByUrl('/auth/login');
        }
        return throwError(err);
      }),
    );
  }
}
