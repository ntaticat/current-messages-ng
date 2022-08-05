import { IChat } from './../../../data/interfaces/chat.interfaces';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUser } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';
import { SignalrService } from 'src/app/data/services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  userId: string = "a26e357a-c6ec-47d9-bb51-08da767211d1";
  chatId: string = "";
  chatData: IChat = {
    chatId: "",
    messages: [],
    users: []
  };
  newChatMessageSub: Subscription = new Subscription();

  constructor(private api: ApiService, private route: ActivatedRoute, private signalr: SignalrService) { }

  ngOnInit(): void {
    this.signalr.startConnection();
    this.signalr.sendChatMessageListener();
    this.signalr.newChatMessage$.subscribe(chatMessageData => {
      if(chatMessageData) {
        this.chatData.messages.push(chatMessageData);
      }
    });

    this.route.paramMap.subscribe(paramMap => {
      this.chatId = paramMap.get("id")!;
      this.api.getChat(this.chatId).subscribe(chatData => {
        this.chatData = chatData;
      });
    });
  }

  ngOnDestroy(): void {
    this.signalr.closeConnection();
  }

}
