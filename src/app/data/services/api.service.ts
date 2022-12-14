import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IChat, IChatMessagePost } from '../interfaces/chat.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getChat(id: string): Observable<IChat> {
    const path = `${this.apiUrl}/chats/${id}`;

    return this.http.get<IChat>(path);
  }

  postMessageChat(messageData: IChatMessagePost): Observable<{}> {
    const path = `${this.apiUrl}/chatMessages`;

    const body = {
      ...messageData
    };

    return this.http.post(path, body);
  }
}
