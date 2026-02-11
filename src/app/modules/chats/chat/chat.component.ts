import {
  IChat,
  IChatMessagePost,
  ICurrentMessage,
} from './../../../data/interfaces/chat.interfaces';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/data/services/api.service';
import { SignalrService } from 'src/app/data/services/signalr.service';
import { Subscription } from 'rxjs';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  faFloppyDisk = faFloppyDisk;

  userId: string = 'C7A19BC8-A69B-4130-E51E-08DE65F70AA6';
  chatId: string = '';
  chatData: IChat = {
    chatId: '',
    messages: [],
    users: [],
  };

  currentMessages: ICurrentMessage[] = [];

  newChatMessageSub: Subscription = new Subscription();

  messageText: string = '';
  setAsCurrentMessage: boolean = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private signalr: SignalrService,
  ) {}

  async ngOnInit() {
    this.signalr.initHubConnection();

    this.signalr.newChatMessage$.subscribe((chatMessageData) => {
      console.log('SE EMITIO NEWCHATMESSAGE$');
      if (chatMessageData) {
        this.chatData.messages.push(chatMessageData);
        this.getCurrentMessages();
      }
    });

    try {
      await this.signalr.startConnection();
      console.log('SIGNALR CONECTADO');
      this.signalr.sendChatMessageListener();

      this.route.paramMap.subscribe(async (paramMap) => {
        const newChatId = paramMap.get('id')!;

        if (this.chatId && this.chatId !== newChatId) {
          this.signalr.HubConnection.invoke('LeaveChat', this.chatId);
        }

        this.chatId = newChatId;
        await this.joinGroup();

        this.api.getChat(this.chatId).subscribe((chatData) => {
          this.chatData = chatData;
        });
        this.getCurrentMessages();
      });
    } catch (error) {
      console.error('Error conectando a SIGNALR: ', error);
    }
  }

  private async joinGroup() {
    if (this.chatId) {
      console.log('JOIN GROUP CHATID', this.chatId);
      await this.signalr.HubConnection.invoke('JoinChat', this.chatId).catch(
        (err) => console.error('Error al unirse al grupo', err),
      );
    }
  }

  getCurrentMessages() {
    this.api.getCurrentMessages(this.userId).subscribe((currentMessages) => {
      if (currentMessages) {
        this.currentMessages = currentMessages;
      }
    });
  }

  ngOnDestroy(): void {
    this.signalr.closeConnection();
  }

  onClickToggleSetCurrentMessage() {
    this.setAsCurrentMessage = !this.setAsCurrentMessage;
  }

  onClickCurrentMessage(message: string) {
    if (!this.userId) {
      console.error('No se puede enviar mensaje');
      return;
    }

    const data: IChatMessagePost = {
      chatOwnerId: this.chatId,
      messageText: message,
      userId: this.userId,
      setAsCurrentMessage: false,
    };

    this.api.postMessageChat(data).subscribe(() => {
      console.log('Se registró el mensaje');
    });
  }

  onSubmitPostMessage(): void {
    if (!this.userId || !this.messageText) {
      console.error('No se puede enviar mensaje');
      return;
    }

    const data: IChatMessagePost = {
      chatOwnerId: this.chatId,
      messageText: this.messageText,
      userId: this.userId,
      setAsCurrentMessage: this.setAsCurrentMessage,
    };

    this.api.postMessageChat(data).subscribe(() => {
      console.log('Se registró el mensaje');
    });
  }
}
