import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IChatMessage } from '../interfaces/chat.interfaces';
import * as signalR from "@microsoft/signalr";
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  backendUri = environment.backendUri;
  private hubConnection!: signalR.HubConnection;
  newChatMessage$: Subject<IChatMessage> = new Subject();


  async startConnection() {
    const hubUri = `${this.backendUri}/ChatHub/`;

    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUri)
        .build();

      await this.hubConnection.start();
      console.log('Connection started');
    }
    catch (error) {
      console.error('Error while starting connection: ' + error)
    }
  }

  sendChatMessageListener() {
    this.hubConnection.on('SendNewChatMessage', (data: IChatMessage) => {
      this.newChatMessage$.next(data);
    });
  }

  closeConnection() {
    this.hubConnection.stop();
  }

}
