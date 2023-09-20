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

  userId: string = '13d25d22-dc6a-4dee-8f79-08dad582787d';
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
    private signalr: SignalrService
  ) {}

  ngOnInit(): void {
    this.signalr.startConnection();
    this.signalr.sendChatMessageListener();
    this.signalr.newChatMessage$.subscribe((chatMessageData) => {
      if (chatMessageData) {
        this.chatData.messages.push(chatMessageData);
        this.getCurrentMessages();
      }
    });

    this.route.paramMap.subscribe((paramMap) => {
      this.chatId = paramMap.get('id')!;
      this.api.getChat(this.chatId).subscribe((chatData) => {
        this.chatData = chatData;
      });
      this.getCurrentMessages();
    });
  }

  getCurrentMessages() {
    this.api.getCurrentMessages(this.userId).subscribe((currentMessages) => {
      if (!currentMessages) {
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
