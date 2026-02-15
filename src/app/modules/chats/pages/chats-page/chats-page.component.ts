import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IChat, IUser } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.scss'],
})
export class ChatsPageComponent implements OnInit, OnDestroy {
  chats: IChat[] = [];
  userData: IUser = {
    id: '',
    fullName: '',
  };

  showNewChatModal: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getUserProfile();
    this.getChats();
  }

  onClickCopyId() {
    alert('Se ha copiado el Id en el portapapeles');
  }

  toggleShowNewChatModal() {
    this.showNewChatModal = !this.showNewChatModal;
  }

  onChatCreated() {
    this.getChats();
    this.toggleShowNewChatModal();
  }

  onClickEnterChat(chatId: string) {
    this.router.navigate(['/', 'chats', chatId]);
  }

  getChats() {
    this.api
      .getChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((chats) => {
        if (chats != null) {
          this.chats = [...this.ordenarChatsPorFecha(chats)];
        }
      });
  }

  ordenarChatsPorFecha(chats: IChat[]) {
    return chats.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
