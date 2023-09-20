import { Component, OnInit } from '@angular/core';
import { IChat } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  userId = "13D25D22-DC6A-4DEE-8F79-08DAD582787D";
  chatList: IChat[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.getChats(this.userId).subscribe((chats) => {
      if(chats != null) {
        this.chatList = chats;
      }
    });

  }

}
