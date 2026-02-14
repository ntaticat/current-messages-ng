import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IChat, IUser } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.scss'],
})
export class ChatsPageComponent implements OnInit {
  chats: IChat[] = [];
  userData: IUser = {
    id: '',
    fullName: '',
  };

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUserProfile();
    this.getChats();
  }

  onClickEnterChat(chatId: string) {
    this.router.navigate(['/', 'chats', chatId]);
  }

  getChats() {
    this.api.getChats().subscribe((chats) => {
      if (chats != null) {
        this.chats = chats;
      }
    });
  }

  getUserProfile() {
    this.api.getUserProfile().subscribe((userProfile) => {
      if (userProfile) {
        this.userData = userProfile;
      }
    });
  }
}
