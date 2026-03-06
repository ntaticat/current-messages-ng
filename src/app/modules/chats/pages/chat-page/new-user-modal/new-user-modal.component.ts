import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IChatParticipantPost } from 'src/app/data/interfaces/chat.interfaces';
import { ApiService } from 'src/app/data/services/api.service';
import { CryptoService } from 'src/app/data/services/crypto.service';
import { SessionCryptoService } from 'src/app/data/services/session-crypto.service';

@Component({
  selector: 'app-new-user-modal',
  templateUrl: './new-user-modal.component.html',
  styleUrls: ['./new-user-modal.component.scss'],
})
export class NewUserModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter();
  @Input() chatId: string = '';
  isLoading = false;

  constructor(
    private api: ApiService,
    private cryptoService: CryptoService,
    private sessionCrypto: SessionCryptoService,
  ) {}

  ngOnInit(): void {}

  closeModal() {
    this.closeModalEvent.emit();
  }

  async onSubmitAddParticipant(guestId: string) {
    if (!guestId.trim()) {
      alert('Ingresa un Id válido.');
      return;
    }
    this.isLoading = true;

    try {
      // 1. Obtener PublicKey del guest
      const { publicKey: guestPublicKeyBase64 } = await firstValueFrom(
        this.api.getUserPublicKey(guestId),
      );

      // 2. Obtener mi EncryptedRoomKey del servidor
      const { roomKey: encryptedRoomKey } = await firstValueFrom(
        this.api.getMyRoomKey(this.chatId),
      );

      // 3. Obtener mi privateKey de memoria
      const privateKey = this.sessionCrypto.getPrivateKey();

      // 4. Descifrar la RoomKey con mi privateKey → RoomKey en claro
      const roomKeyBase64 = await this.cryptoService.decryptRoomKey(
        encryptedRoomKey,
        privateKey,
      );

      // 5. Importar PublicKey del guest y cifrar la RoomKey para él
      const guestPublicKey =
        await this.cryptoService.importPublicKey(guestPublicKeyBase64);
      const encryptedRoomKeyForGuest = await this.cryptoService.encryptRoomKey(
        roomKeyBase64,
        guestPublicKey,
      );

      const data: IChatParticipantPost = {
        guestId,
        encryptedRoomKeyForGuest,
      };
      await firstValueFrom(this.api.postChatParticipant(this.chatId, data));
      this.closeModal();
    } catch (error) {
      alert('No se pudo registrar al participante en el chat');
      console.error(error);
    }
  }
}
