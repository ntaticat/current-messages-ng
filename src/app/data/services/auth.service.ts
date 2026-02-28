import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ILoginPost,
  IRegisterPost,
  IToken,
} from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'conejito-messages-jwt';

  register(data: IRegisterPost) {
    return this.http
      .post<string>(`${this.apiUrl}/Auth/register`, data)
      .pipe(shareReplay());
  }

  login(loginPost: ILoginPost) {
    return this.http.post<IToken>(`${this.apiUrl}/Auth/login`, loginPost).pipe(
      tap((resp) => this.saveToken(resp.token)),
      shareReplay(),
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    // Considera usar un Subject para notificar el estado de auth
  }

  private saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
