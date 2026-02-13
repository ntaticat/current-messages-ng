import { Component, OnInit } from '@angular/core';
import { IChat } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  chats: IChat[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getChats().subscribe((chats) => {
      if (chats != null) {
        this.chats = chats;
      }
    });
  }
}
