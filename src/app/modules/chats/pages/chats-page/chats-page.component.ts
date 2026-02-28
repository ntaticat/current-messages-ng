import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IChat, IUser } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { NewChatModalComponent } from './new-chat-modal/new-chat-modal.component';

@Component({
  selector: 'app-chats-page',
  standalone: true, // Aseguramos que sea explícito
  imports: [CdkCopyToClipboard, NewChatModalComponent],
  templateUrl: './chats-page.component.html',
  styleUrl: './chats-page.component.scss',
})
export class ChatsPageComponent implements OnInit {
  // Inyecciones modernas
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estado usando Signals para reactividad eficiente
  chats = signal<IChat[]>([]);
  userData = signal<IUser>({
    id: '',
    fullName: '',
  });
  showNewChatModal = signal<boolean>(false);

  ngOnInit(): void {
    this.getUserProfile();
    this.getChats();
  }

  onClickCopyId(): void {
    alert('Se ha copiado el Id en el portapapeles');
  }

  toggleShowNewChatModal(): void {
    this.showNewChatModal.update((state) => !state);
  }

  onChatCreated(): void {
    this.getChats();
    this.toggleShowNewChatModal();
  }

  onClickEnterChat(chatId: string): void {
    this.router.navigate(['/', 'chats', chatId]);
  }

  getChats(): void {
    this.api
      .getChats()
      .pipe(takeUntilDestroyed(this.destroyRef)) // Limpieza automática sin ngOnDestroy
      .subscribe((chats) => {
        if (chats) {
          const chatsOrdenados = this.ordenarChatsPorFecha(chats);
          this.chats.set([...chatsOrdenados]);
        }
      });
  }

  ordenarChatsPorFecha(chats: IChat[]): IChat[] {
    return [...chats].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  getUserProfile(): void {
    this.api
      .getUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((userProfile) => {
        if (userProfile) {
          this.userData.set(userProfile);
        }
      });
  }
}
