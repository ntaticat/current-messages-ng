import { Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IChatPost } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';
import { CryptoService } from 'src/app/data/services/crypto.service';

@Component({
  selector: 'app-new-chat-modal',
  templateUrl: './new-chat-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./new-chat-modal.component.scss'],
})
export class NewChatModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter();
  isLoading = false;
  errorMessage: string | null = null;
  readonly nombresSugeridos = ['Familia', 'Trabajo', 'Proyecto X'];

  constructor(
    private api: ApiService,
    private cryptoService: CryptoService,
  ) {}

  ngOnInit(): void {}

  async onSubmitChat(name: string) {
    if (!name.trim()) {
      this.errorMessage = 'Escribe un nombre para tu chat';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      // 1. Obtener perfil para acceder a la PublicKey propia
      const profile = await firstValueFrom(this.api.getUserProfile());

      if (!profile.publicKey) {
        this.errorMessage = 'No tienes claves E2EE registradas';
        return;
      }

      // 2. Generar RoomKey AES-256 aleatoria para este chat
      const roomKeyBase64 = await this.cryptoService.generateRoomKey();

      // 3. Importar propia PublicKey y cifrar la RoomKey con ella
      const publicKey = await this.cryptoService.importPublicKey(
        profile.publicKey,
      );
      const encryptedRoomKey = await this.cryptoService.encryptRoomKey(
        roomKeyBase64,
        publicKey,
      );

      // 4. Crear el chat con la RoomKey ya cifrada
      const data: IChatPost = {
        name,
        encryptedRoomKey,
      };
      await firstValueFrom(this.api.postChat(data));
      this.closeModal();
    } catch (error) {
      this.errorMessage = 'No se pudo crear el chat, intenta de nuevo';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.closeModalEvent.emit();
  }
}
