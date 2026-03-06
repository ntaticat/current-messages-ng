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
import { ILoginPost } from 'src/app/data/interfaces/auth.interfaces';
import { ApiService } from 'src/app/data/services/api.service';
import { AuthService } from 'src/app/data/services/auth.service';
import { CryptoService } from 'src/app/data/services/crypto.service';
import { KeyStorageService } from 'src/app/data/services/key-storage.service';
import { SessionCryptoService } from 'src/app/data/services/session-crypto.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
})
export class LoginPageComponent implements OnInit {
  loginForm: UntypedFormGroup;
  isLoading = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private api: ApiService,
    private cryptoService: CryptoService,
    private keyStorage: KeyStorageService,
    private sessionCrypto: SessionCryptoService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.authService.logout();
    this.sessionCrypto.clear();
    await this.keyStorage.clear();
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      alert('El formulario no es valido');
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    try {
      // 1. Login normal — guarda el JWT
      const credentials: ILoginPost = {
        email,
        password,
      };

      await firstValueFrom(this.authService.login(credentials));

      // 2. Obtener public keys — trae la encryptedPrivateKey del servidor
      const profile = await firstValueFrom(this.api.getUserProfile());

      if (!profile.hasKeys) {
        // En fase 2 aquí generarías las claves retroactivamente
        alert('Tu cuenta no tiene claves E2EE. Contacta al administrador.');
        return;
      }

      // 3. Separar encrypted y iv del blob "encrypted:iv"
      const [encrypted, iv] = profile.encryptedPrivateKey.split(':');

      // 4. Descifrar la privateKey con la password — solo toca memoria
      const privateKeyBase64 = await this.cryptoService.decryptPrivateKey(
        encrypted,
        iv,
        password,
      );

      // 5. Persistir en IndexedDB para la sesión actual
      await this.keyStorage.save('privateKey', encrypted);
      await this.keyStorage.save('privateKeyIv', iv);

      // 6. Se importa la clave y se guarda en memoria RAM
      const privateKeyCryptoKey =
        await this.cryptoService.importPrivateKey(privateKeyBase64);
      this.sessionCrypto.setPrivateKey(privateKeyCryptoKey);

      this.router.navigateByUrl('/chats');
    } catch (error) {
      alert('No se pudo iniciar sesión');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
