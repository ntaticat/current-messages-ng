import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  computed,
  Injector,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFloppyDisk,
  faArrowUp,
  faDoorOpen,
  faBoltLightning,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

import { ApiService } from 'src/app/data/services/api.service';
import { SignalrService } from 'src/app/data/services/signalr.service';
import { NewUserModalComponent } from './new-user-modal/new-user-modal.component';
import {
  IChat,
  IChatMessage,
  IChatMessagePost,
  IQuickMessage,
  IUser,
} from '../../../../data/interfaces/chat.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NewUserModalComponent,
  ],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly signalr = inject(SignalrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly icons = {
    faFloppyDisk,
    faArrowUp,
    faDoorOpen,
    faBoltLightning,
    faUserPlus,
  };

  // Signals de estado
  userData = signal<IUser | null>(null);
  chatData = signal<IChat | null>(null);
  quickMessages = signal<IQuickMessage[]>([]);
  showAddParticipantModal = signal(false);
  chatId = '';
  private _rawChatMessages = signal<IChatMessage[]>([]);
  readonly chatMessages = computed(() => {
    return [...this._rawChatMessages()].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
  });

  chatForm = new FormGroup({
    messageText: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    // Effect: Reacciona automáticamente cuando SignalR recibe un mensaje
    this.signalr.message$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => {
        this._rawChatMessages.update((prev) => {
          const existe = prev.some(
            (m) => m.chatMessageId === msg.chatMessageId,
          );
          return existe ? prev : [...prev, msg];
        });
      });
  }

  async ngOnInit() {
    try {
      await this.signalr.startConnection();

      this.route.paramMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async (params) => {
          const chatId = params.get('chatId')!;

          this._rawChatMessages.set([]);

          if (this.chatId && this.chatId !== chatId)
            await this.signalr.leaveGroup(this.chatId);

          this.chatId = chatId;
          await this.signalr.joinGroup(this.chatId);
          this.loadInitialData();
        });
    } catch (err) {
      console.error('Connection Error:', err);
    }
  }

  private loadInitialData() {
    this.api.getChat(this.chatId).subscribe((data) => this.chatData.set(data));
    this.api.getUserProfile().subscribe((user) => this.userData.set(user));
    this.api.getQuickMessages().subscribe((qm) => this.quickMessages.set(qm));
    this.api
      .getChatMessages(this.chatId)
      .subscribe((msgs) => this._rawChatMessages.set(msgs));
  }

  onSubmitChatMessage() {
    if (this.chatForm.invalid) return;

    const data: IChatMessagePost = {
      chatId: this.chatId,
      message: this.chatForm.controls.messageText.value,
    };

    this.api.postChatMessage(data).subscribe({
      next: () => this.chatForm.reset(),
      error: () => alert('Error al enviar'),
    });
  }

  async ngOnDestroy() {
    await this.signalr.leaveGroup(this.chatId);
    this.signalr.closeConnection();
  }

  onClickExit() {
    this.router.navigateByUrl('/chats');
  }
}
