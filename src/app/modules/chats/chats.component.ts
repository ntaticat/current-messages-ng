import { Component, OnInit } from '@angular/core';
import { IChat } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  userId = 'C7A19BC8-A69B-4130-E51E-08DE65F70AA6';
  chatList: IChat[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getChats(this.userId).subscribe((chats) => {
      if (chats != null) {
        this.chatList = chats;
      }
    });
  }
}
