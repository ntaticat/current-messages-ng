import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IChatMessage } from '../interfaces/chat.interfaces';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  backendUri = environment.backendUri;
  private hubConnection!: signalR.HubConnection;
  newChatMessage$: Subject<IChatMessage> = new Subject();

  initHubConnection() {
    const hubUri = `${this.backendUri}/hubs/chat`;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUri)
      .withAutomaticReconnect()
      .build();
  }

  async startConnection() {
    if (!this.hubConnection) {
      this.initHubConnection();
    }
    return this.hubConnection.start();
  }

  sendChatMessageListener() {
    this.hubConnection.on('ReceiveMessage', (data: IChatMessage) => {
      this.newChatMessage$.next(data);
    });
  }

  closeConnection() {
    this.hubConnection.stop();
    console.info('Connection stopped');
  }

  async joinGroup(chatId: string) {
    await this.hubConnection
      .invoke('JoinChat', chatId)
      .catch((err) => console.error('Error al unirse al grupo', err));
  }

  async leaveGroup(chatId: string) {
    await this.hubConnection
      .invoke('LeaveChat', chatId)
      .catch((err) => console.error('Error al salirse del grupo', err));
  }
}
