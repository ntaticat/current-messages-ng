import { Injectable, inject } from '@angular/core'; // 1. Importa inject
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IChat,
  IChatMessage,
  IChatMessagePost,
  IChatParticipantPost,
  IChatPost,
  IChatRoomKey,
  IPublicKey,
  IQuickMessage,
  IQuickMessagePost,
  IUser,
} from '../interfaces/chat.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // 2. Inyección moderna sin constructor (más limpio para testing)
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // 3. Uso de Template Strings optimizado
  getUserProfile(): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/Users`);
  }

  getUserPublicKey(guestId: string): Observable<IPublicKey> {
    return this.http.get<IPublicKey>(
      `${this.apiUrl}/Users/${guestId}/public-key`,
    );
  }

  getMyRoomKey(chatId: string): Observable<IChatRoomKey> {
    return this.http.get<IChatRoomKey>(
      `${this.apiUrl}/Chats/${chatId}/my-room-key`,
    );
  }

  getChat(chatId: string): Observable<IChat> {
    return this.http.get<IChat>(`${this.apiUrl}/chats/${chatId}`);
  }

  getChats(): Observable<IChat[]> {
    return this.http.get<IChat[]>(`${this.apiUrl}/chats`);
  }

  postChat(data: IChatPost): Observable<any> {
    return this.http.post(`${this.apiUrl}/chats`, data);
  }

  getChatMessages(
    chatId: string,
    page = 1,
    pageSize = 50,
  ): Observable<IChatMessage[]> {
    return this.http.get<IChatMessage[]>(
      `${this.apiUrl}/Chats/${chatId}/messages`,
      { params: { page, pageSize } }, // 5. Usa 'params' para mayor seguridad con caracteres especiales
    );
  }

  getQuickMessages(): Observable<IQuickMessage[]> {
    return this.http.get<IQuickMessage[]>(`${this.apiUrl}/QuickMessages`);
  }

  postQuickMessage(data: IQuickMessagePost): Observable<Object> {
    return this.http.post(`${this.apiUrl}/QuickMessages`, data);
  }

  postChatMessage(data: IChatMessagePost): Observable<Object> {
    return this.http.post(`${this.apiUrl}/ChatMessages`, data);
  }

  postChatParticipant(
    chatId: string,
    data: IChatParticipantPost,
  ): Observable<Object> {
    return this.http.post(`${this.apiUrl}/Chats/${chatId}/participants`, data);
  }
}
