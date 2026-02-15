import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IChat,
  IChatMessage,
  IChatMessagePost,
  IChatParticipantPost,
  IChatPost,
  IQuickMessage,
  IQuickMessagePost,
  IUser,
} from '../interfaces/chat.interfaces';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<IUser> {
    const path = `${this.apiUrl}/Users`;

    return this.http.get<IUser>(path);
  }

  getChat(chatId: string): Observable<IChat> {
    const path = `${this.apiUrl}/chats/${chatId}`;

    return this.http.get<IChat>(path);
  }

  getChats(): Observable<IChat[]> {
    let path = `${this.apiUrl}/chats`;
    return this.http.get<IChat[]>(path);
  }

  postChat(data: IChatPost) {
    const path = `${this.apiUrl}/chats`;
    return this.http.post(path, data);
  }

  getChatMessages(chatId: string, page: number = 1, pageSize: number = 50) {
    let path = `${this.apiUrl}/Chats/${chatId}/messages?page=${page}&pageSize=${pageSize}`;

    return this.http.get<IChatMessage[]>(path);
  }

  getQuickMessages() {
    let path = `${this.apiUrl}/QuickMessages`;

    return this.http.get<IQuickMessage[]>(path);
  }

  postQuickMessage(data: IQuickMessagePost): Observable<{}> {
    const path = `${this.apiUrl}/QuickMessages`;

    return this.http.post(path, data);
  }

  postChatMessage(data: IChatMessagePost): Observable<{}> {
    const path = `${this.apiUrl}/ChatMessages`;

    const body = {
      ...data,
    };

    return this.http.post(path, body);
  }

  postChatParticipant(
    chatId: string,
    data: IChatParticipantPost,
  ): Observable<{}> {
    const path = `${this.apiUrl}/Chats/${chatId}/participants`;

    const body = {
      ...data,
    };

    return this.http.post(path, body);
  }
}
