import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IChatPost } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';

@Component({
  selector: 'app-new-chat-modal',
  templateUrl: './new-chat-modal.component.html',
  styleUrls: ['./new-chat-modal.component.scss'],
})
export class NewChatModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter();

  constructor(private api: ApiService) {}

  ngOnInit(): void {}

  onSubmitChat(name: string) {
    if (!name.trim()) {
      alert('El formulario no es valido');
      return;
    }

    const data: IChatPost = {
      name,
    };

    this.api.postChat(data).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (err) => {
        alert('No se pudo registrar el chat');
        console.error(err);
      },
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }
}
