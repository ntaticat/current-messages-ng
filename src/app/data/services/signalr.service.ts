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

  get HubConnection() {
    return this.hubConnection;
  }

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
    this.hubConnection.on('MessageReceived', (data: IChatMessage) => {
      console.log('¡MENSAJE RECIBIDO DEL SERVIDOR!', data);
      this.newChatMessage$.next(data);
    });
  }

  closeConnection() {
    this.hubConnection.stop();
    console.info('Connection stopped');
  }
}
