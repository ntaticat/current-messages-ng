import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule,FormsModule, ReactiveFormsModule, RouterLink],
})
export class SignupPageComponent implements OnInit, OnDestroy {
  registerForm: UntypedFormGroup;
  isLoading = false;
  isSlow = false;
  errorMessage: string | null = null;

  private readonly SLOW_THRESHOLD_MS = 4000;
  private slowTimer: ReturnType<typeof setTimeout> | null = null;

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

  async ngOnDestroy() {
    this.clearSlowTimer();
  }

  async onSubmit() {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.isSlow = false;
    this.startSlowTimer();

    const { fullName, email, password } = this.registerForm.value;
    let accountCreated = false;

    try {
      // 1. Crear cuenta en el servidor
      const registerPost: IRegisterPost = {
        fullName,
        email,
        password,
      };

      await firstValueFrom(this.authService.register(registerPost));
      accountCreated = true;

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
      this.errorMessage = accountCreated
        ? 'Tu cuenta se creó, pero hubo un problema configurando tus claves. Intenta iniciar sesión o contacta soporte.'
        : 'No se pudo crear la cuenta. Verifica tus datos e inténtalo de nuevo.';
      console.error(error);
    } finally {
      this.isLoading = false;
      this.isSlow = false;
      this.clearSlowTimer();
    }
  }

  private startSlowTimer() {
    this.slowTimer = setTimeout(() => {
      this.isSlow = true;
    }, this.SLOW_THRESHOLD_MS);
  }

  private clearSlowTimer() {
    if (this.slowTimer) {
      clearTimeout(this.slowTimer);
      this.slowTimer = null;
    }
  }
}
