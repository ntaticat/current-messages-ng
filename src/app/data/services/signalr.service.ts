import { Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IChatMessage } from '../interfaces/chat.interfaces';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  constructor() {
    console.log('CONSTRUIR SERVICIO SIGNAL');
  }

  private readonly backendUri = environment.backendUri;
  private hubConnection!: signalR.HubConnection;

  // Signal que emite el último mensaje recibido
  newChatMessage = signal<IChatMessage | null>(null);

  initHubConnection() {
    const hubUri = `${this.backendUri}/hubs/chat`;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUri, {
        // En Angular 21 es mejor inyectar el token aquí si el hub es protegido
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
      this.clearMessage();
      this.registerListeners();
    }
  }

  closeConnection() {
    this.hubConnection?.stop().then(() => console.info('SignalR Stopped'));
  }

  clearMessage() {
    this.newChatMessage.set(null);
  }

  private registerListeners() {
    this.hubConnection.off('ReceiveMessage');

    this.hubConnection.on('ReceiveMessage', (data: IChatMessage) => {
      this.newChatMessage.set(data);
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
