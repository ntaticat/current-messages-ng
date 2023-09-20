import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IChat, IChatMessagePost, ICurrentMessage } from '../interfaces/chat.interfaces';
import { map, Observable, tap } from 'rxjs';

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

  getChats(userId: string = ""): Observable<IChat[]> {
    let path = `${this.apiUrl}/chats`;

    if(userId != "") {
      path = path.concat(`?user=${userId}`);
    }

    return this.http.get<IChat[]>(path);
  }

  getCurrentMessages(userId: string = "") {
    let path = `${this.apiUrl}/currentMessages`;

    if(userId != "") {
      path = path.concat(`?userId=${userId}`);
    }

    return this.http.get<ICurrentMessage[]>(path);
  }

  postMessageChat(messageData: IChatMessagePost): Observable<{}> {
    const path = `${this.apiUrl}/chatMessages`;

    const body = {
      ...messageData
    };

    return this.http.post(path, body);
  }
}
