import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IChatParticipantPost } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-new-user-modal',
  templateUrl: './new-user-modal.component.html',
  styleUrls: ['./new-user-modal.component.scss'],
})
export class NewUserModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter();

  @Input() chatId: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {}

  closeModal() {
    this.closeModalEvent.emit();
  }

  onSubmitAddParticipant(uuid: string) {
    if (uuid.trim().length > 0) {
      const data: IChatParticipantPost = {
        guestId: uuid,
      };

      this.api.postChatParticipant(this.chatId, data).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          alert('No se pudo registrar al participante en el chat');
          console.error(err);
        },
      });
    } else {
      alert('Ingresa un Id válido.');
    }
  }
}
