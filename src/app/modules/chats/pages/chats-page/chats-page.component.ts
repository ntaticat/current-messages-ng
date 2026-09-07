import {
  Component,
  OnInit,
  signal,
  inject,
  DestroyRef,
  AfterViewInit,
  ChangeDetectionStrategy
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chats-page.component.scss',
})
export class ChatsPageComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    const colores = [
      ['#c0392b', '#a93226'],
      ['#f0a500', '#d4920a'],
      ['#1a6b3c', '#145c32'],
      ['#8e44ad', '#7d3c98'],
      ['#2980b9', '#1a6ea0'],
      ['#e67e22', '#d4711e'],
    ];
    const container = document.getElementById('papel-picado-root');
    if (container) {
      const count = Math.ceil(window.innerWidth / 60) + 2;
      for (let i = 0; i < count; i++) {
        const [c1] = colores[i % colores.length];
        const delay = (i * 0.18) % 3;
        const el = document.createElement('div');
        el.style.cssText = `flex:1;min-width:48px;max-width:68px;`;
        el.innerHTML = `<svg viewBox="0 0 40 22" style="width:100%;height:56px;animation:sway 3s ${delay}s ease-in-out infinite;transform-origin:top center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5))">
      <polygon points="2,0 38,0 20,20" fill="${c1}"/>
      <circle cx="20" cy="10" r="4" fill="rgba(0,0,0,0.2)"/>
    </svg>`;
        container.appendChild(el);
      }
    }
  }
  // Inyecciones modernas
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estado usando Signals para reactividad eficiente
  chats = signal<IChat[]>([]);
  userData = signal<IUser>({
    id: '',
    fullName: '',
    hasKeys: false,
    publicKey: '',
    encryptedPrivateKey: '',
  });
  showNewChatModal = signal<boolean>(false);
  idCopied = signal(false);

  ngOnInit(): void {
    this.getUserProfile();
    this.getChats();
  }

  onClickCopyId(): void {
    this.idCopied.set(true);
    setTimeout(() => this.idCopied.set(false), 2000);
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
