import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IRegisterPost } from 'src/app/data/interfaces/auth.interfaces';
import { AuthService } from 'src/app/data/services/auth.service';
import { CryptoService } from 'src/app/data/services/crypto.service';
import { KeyStorageService } from 'src/app/data/services/key-storage.service';
import { SessionCryptoService } from 'src/app/data/services/session-crypto.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
})
export class SignupPageComponent implements OnInit {
  registerForm: UntypedFormGroup;
  isLoading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private keyStorage: KeyStorageService,
    private sessionCrypto: SessionCryptoService,
  ) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async ngOnInit() {
    this.authService.logout();
    this.sessionCrypto.clear();
    await this.keyStorage.clear();
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      alert('El formulario no es valido');
      return;
    }

    this.isLoading = true;

    const { fullName, email, password } = this.registerForm.value;

    try {
      // 1. Crear cuenta en el servidor
      const registerPost: IRegisterPost = {
        fullName,
        email,
        password,
      };

      await firstValueFrom(this.authService.register(registerPost));

      // 2. Generar par de claves RSA en el cliente
      const keyPair = await this.cryptoService.generateKeyPair();
      const publicKeyBase64 = await this.cryptoService.exportPublicKey(
        keyPair.publicKey,
      );
      const privateKeyBase64 = await this.cryptoService.exportPrivateKey(
        keyPair.privateKey,
      );

      // 3. Cifrar la privateKey con la password antes de guardarla o subirla
      const { encrypted, iv } = await this.cryptoService.encryptPrivateKey(
        privateKeyBase64,
        password,
      );

      // 4. Guardar en IndexedDB — persiste entre sesiones sin ir al servidor en claro
      await this.keyStorage.save('privateKey', encrypted);
      await this.keyStorage.save('privateKeyIv', iv);

      // 5. Subir publicKey + encryptedPrivateKey al servidor (subir encryptedPrivateKey debería ser temporal)
      await firstValueFrom(
        this.authService.registerKeys({
          publicKey: publicKeyBase64,
          encryptedPrivateKey: `${encrypted}:${iv}`, // servidor guarda el blob completo
        }),
      );

      // 6. Se importa la clave y se guarda en memoria RAM
      const privateKeyCryptoKey =
        await this.cryptoService.importPrivateKey(privateKeyBase64);
      this.sessionCrypto.setPrivateKey(privateKeyCryptoKey);

      this.router.navigateByUrl('/chats');
    } catch (error) {
      alert('No se pudo registrar el usuario');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
