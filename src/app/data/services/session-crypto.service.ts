import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionCryptoService {
  private privateKey: CryptoKey | null = null;

  setPrivateKey(key: CryptoKey): void {
    this.privateKey = key;
  }

  getPrivateKey(): CryptoKey {
    if (!this.privateKey)
      throw new Error('No hay privateKey en sesión. Vuelve a iniciar sesión.');
    return this.privateKey;
  }

  hasPrivateKey(): boolean {
    return this.privateKey !== null;
  }

  clear(): void {
    this.privateKey = null;
  }
}
