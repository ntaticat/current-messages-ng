import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IChatMessage } from '../interfaces/chat.interfaces';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private readonly backendUri = environment.backendUri;
  private hubConnection!: signalR.HubConnection;

  private messageSubject = new Subject<IChatMessage>();
  readonly message$ = this.messageSubject.asObservable();

  initHubConnection() {
    const hubUri = `${this.backendUri}/hubs/chat`;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUri, {
        accessTokenFactory: () =>
          localStorage.getItem('conejito-messages-jwt') || '',
      })
      .withAutomaticReconnect()
      .build();
  }

  async startConnection() {
    if (!this.hubConnection) this.initHubConnection();

    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      await this.hubConnection.start();
      this.registerListeners();
    }
  }

  closeConnection() {
    this.hubConnection?.stop().then(() => console.info('SignalR Stopped'));
  }

  private registerListeners() {
    this.hubConnection.off('ReceiveMessage');

    this.hubConnection.on('ReceiveMessage', (data: IChatMessage) => {
      this.messageSubject.next(data);
    });
  }

  async joinGroup(chatId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinChat', chatId).catch(console.error);
    }
  }

  async leaveGroup(chatId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveChat', chatId).catch(console.error);
    }
  }
}
