import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  ILoginPost,
  IRegisterPost,
  IToken,
} from '../interfaces/auth.interfaces';
import { map, shareReplay, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: IRegisterPost) {
    const method = `Auth/register`;
    return this.http
      .post<string>(`${this.apiUrl}/${method}`, data)
      .pipe(shareReplay());
  }

  login(loginPost: ILoginPost) {
    const method = `Auth/login`;
    return this.http.post<IToken>(`${this.apiUrl}/${method}`, loginPost).pipe(
      tap({
        next: (resp) => this.saveToken(resp.token),
      }),
      map((resp) => resp),
      shareReplay(),
    );
  }

  clearSession() {
    localStorage.clear();
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
}
