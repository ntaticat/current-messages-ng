import {
  IChat,
  IChatMessage,
  IChatMessagePost,
  IQuickMessage,
  IQuickMessagePost,
  IUser,
} from '../../../../data/interfaces/chat.interfaces';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/data/services/api.service';
import { SignalrService } from 'src/app/data/services/signalr.service';
import { Subscription, takeUntil } from 'rxjs';
import {
  faFloppyDisk,
  faArrowUp,
  faDoorOpen,
  faBoltLightning,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from '@microsoft/signalr';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, OnDestroy {
  faFloppyDisk = faFloppyDisk;
  faArrowUp = faArrowUp;
  faDoorOpen = faDoorOpen;
  faBoltLightning = faBoltLightning;
  faUserPlus = faUserPlus;

  userData: IUser = {
    id: '',
    fullName: '',
  };

  chatId: string = '';
  chatData: IChat = {
    chatId: '',
    name: '',
    createdAt: new Date(),
    users: [],
  };

  showAddParticipantModal: boolean = false;
  showQuickMessages: boolean = false;

  quickMessages: IQuickMessage[] = [];
  chatMessages: IChatMessage[] = [];

  newChatMessageSub: Subscription = new Subscription();

  chatMessageForm: FormGroup;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private signalr: SignalrService,
  ) {
    this.chatMessageForm = new FormGroup({
      messageText: new FormControl('', [Validators.required]),
    });
  }

  async ngOnInit() {
    this.signalr.initHubConnection();

    this.signalr.newChatMessage$.subscribe((newChatMessage) => {
      if (newChatMessage) {
        const exists = this.chatMessages.some(
          (chatMessage) =>
            chatMessage.chatMessageId === newChatMessage.chatMessageId,
        );
        if (!exists) {
          this.chatMessages.push(newChatMessage);
        }
      }
    });

    try {
      await this.signalr.startConnection();
      this.signalr.sendChatMessageListener();

      this.route.paramMap.subscribe(async (paramMap) => {
        const newChatId = paramMap.get('id')!;

        if (this.chatId && this.chatId !== newChatId) {
          this.signalr.leaveGroup(this.chatId);
        }

        this.chatId = newChatId;
        await this.signalr.joinGroup(this.chatId);

        this.api.getChat(this.chatId).subscribe((chatData) => {
          this.chatData = chatData;
        });
        this.getUserProfile();
        this.getChatMessages();
        this.getQuickMessages();
      });
    } catch (error) {
      console.error('Error conectando a SIGNALR: ', error);
    }
  }

  ngOnDestroy(): void {
    this.signalr.closeConnection();
  }

  toggleShowAddParticipantModal() {
    this.showAddParticipantModal = !this.showAddParticipantModal;
  }

  onAddParticipant() {
    this.toggleShowAddParticipantModal();
  }

  onClickExit() {
    this.router.navigateByUrl('/chats');
  }

  toggleShowQuickMessages() {
    this.showQuickMessages = !this.showQuickMessages;
  }

  ordenarChatMessagesPorFecha(messages: IChatMessage[]) {
    return messages.sort((a, b) => {
      return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
    });
  }

  getUserProfile() {
    this.api.getUserProfile().subscribe({
      next: (userProfile) => {
        if (userProfile) {
          this.userData = userProfile;
        }
      },
    });
  }

  getChatMessages() {
    this.api.getChatMessages(this.chatId).subscribe((chatMessages) => {
      if (chatMessages) {
        this.chatMessages = [...this.ordenarChatMessagesPorFecha(chatMessages)];
      }
    });
  }

  getQuickMessages() {
    this.api.getQuickMessages().subscribe((quickMessages) => {
      if (quickMessages) {
        this.quickMessages = quickMessages;
      }
    });
  }

  onClickQuickMessage(message: string) {
    const data: IChatMessagePost = {
      chatId: this.chatId,
      message,
    };

    this.api.postChatMessage(data).subscribe(() => {});
  }

  saveQuickMessage(chatMessageId: string) {
    const data: IQuickMessagePost = {
      chatMessageId,
    };

    this.api.postQuickMessage(data).subscribe(() => {});
  }

  onSubmitChatMessage(): void {
    if (this.chatMessageForm.invalid) {
      return;
    }

    const messageText: string =
      this.chatMessageForm.get('messageText')?.value ?? '';

    const data: IChatMessagePost = {
      chatId: this.chatId,
      message: messageText,
    };

    this.api.postChatMessage(data).subscribe({
      next: () => {
        this.chatMessageForm.get('messageText')?.reset();
      },
      error: (err) => {
        alert('No se pudo registrar el mensaje');
        console.error(err);
      },
    });
  }
}
