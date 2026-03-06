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
import { CryptoService } from 'src/app/data/services/crypto.service';
import { SessionCryptoService } from 'src/app/data/services/session-crypto.service';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NewUserModalComponent,
    DatePipe,
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
  private readonly cryptoService = inject(CryptoService);
  private readonly sessionCrypto = inject(SessionCryptoService);

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

  private roomKey: string | null = null;

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
      .subscribe(async (msg) => {
        const decrypted = await this.decryptMessage(msg);
        this._rawChatMessages.update((prev) => {
          const existe = prev.some((m) => m.id === decrypted.id);
          return existe ? prev : [...prev, decrypted];
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
          this.roomKey = null;

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

  private async loadInitialData() {
    try {
      const [chatData, userProfile, { roomKey: encryptedRoomKey }] =
        await Promise.all([
          firstValueFrom(this.api.getChat(this.chatId)),
          firstValueFrom(this.api.getUserProfile()),
          firstValueFrom(this.api.getMyRoomKey(this.chatId)),
        ]);

      this.chatData.set(chatData);
      this.userData.set(userProfile);

      // Descifrar y cachear la RoomKey una sola vez al entrar al chat
      const privateKey = this.sessionCrypto.getPrivateKey();
      this.roomKey = await this.cryptoService.decryptRoomKey(
        encryptedRoomKey,
        privateKey,
      );

      // Cargar mensajes — en este momento aún no se descifran (siguiente paso)
      const msgs = await firstValueFrom(this.api.getChatMessages(this.chatId));
      const decryptedMsgs = await Promise.all(
        msgs.map((m) => this.decryptMessage(m)),
      );
      this._rawChatMessages.set(decryptedMsgs);
    } catch (error) {
      this.router.navigateByUrl('/auth/login');
    }
  }

  // Método privado helper
  private async decryptMessage(msg: IChatMessage): Promise<IChatMessage> {
    try {
      if (!this.roomKey) return msg;
      const text = await this.cryptoService.decryptMessage(
        msg.encryptedText,
        msg.iv,
        this.roomKey,
      );
      return { ...msg, text };
    } catch {
      // Si falla el descifrado, mostrar indicador en lugar de romper la UI
      return { ...msg, text: '🔒 Mensaje no descifrable' };
    }
  }

  async onSubmitChatMessage() {
    if (this.chatForm.invalid) return;

    if (!this.roomKey) {
      alert('No se pudo obtener la clave del chat');
      return;
    }

    try {
      const text = this.chatForm.controls.messageText.value;

      // Cifrar el mensaje con la RoomKey cacheada
      const { encryptedText, iv } = await this.cryptoService.encryptMessage(
        text,
        this.roomKey,
      );

      const data: IChatMessagePost = {
        chatId: this.chatId,
        encryptedText,
        iv,
      };

      await firstValueFrom(this.api.postChatMessage(data));
      this.chatForm.reset();
    } catch (error) {
      alert('Error al enviar el mensaje');
      console.error(error);
    }
  }

  async ngOnDestroy() {
    await this.signalr.leaveGroup(this.chatId);
    this.signalr.closeConnection();
  }

  onClickExit() {
    this.router.navigateByUrl('/chats');
  }

  getUserName(userId: string): string {
    const participant = this.chatData()?.participants?.find(
      (p) => p.id.toLowerCase() === userId.toLowerCase(),
    );
    return participant?.fullName ?? 'Usuario desconocido';
  }

  // Si prefieres mantenerlo como función tradicional:
  userCanAddParticipants(): boolean {
    const userId = this.userData()?.id;
    if (!userId) return false;

    // .some() es más eficiente: se detiene en cuanto encuentra la coincidencia
    return !!this.chatData()?.participants.some(
      (p) => p.id === userId && ['Admin', 'Owner'].includes(p.role),
    );
  }
}
