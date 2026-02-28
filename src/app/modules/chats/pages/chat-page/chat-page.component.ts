import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
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
  chatMessages = signal<IChatMessage[]>([]);
  quickMessages = signal<IQuickMessage[]>([]);
  showAddParticipantModal = signal(false);
  chatId = '';

  chatForm = new FormGroup({
    messageText: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    // Effect: Reacciona automáticamente cuando SignalR recibe un mensaje
    effect(() => {
      const msg = this.signalr.newChatMessage();

      if (
        msg &&
        !this.chatMessages().some((m) => m.chatMessageId === msg.chatMessageId)
      ) {
        this.chatMessages.update((prev) =>
          this.ordenarMessages([...prev, msg]),
        );
      }
    });
  }

  async ngOnInit() {
    try {
      await this.signalr.startConnection();

      this.route.paramMap.subscribe(async (params) => {
        const chatId = params.get('chatId')!;
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
    // Cargamos todo en paralelo para mejor performance
    this.api.getChat(this.chatId).subscribe((data) => this.chatData.set(data));
    this.api.getUserProfile().subscribe((user) => this.userData.set(user));
    this.api.getQuickMessages().subscribe((qm) => this.quickMessages.set(qm));
    this.api
      .getChatMessages(this.chatId)
      .subscribe((msgs) => this.chatMessages.set(this.ordenarMessages(msgs)));
  }

  private ordenarMessages(messages: IChatMessage[]) {
    return [...messages].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
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
    console.log('Component Destroy');
    this.chatMessages.set([]);
    await this.signalr.leaveGroup(this.chatId);
    this.signalr.closeConnection();
  }

  onClickExit() {
    this.router.navigateByUrl('/chats');
  }
}
