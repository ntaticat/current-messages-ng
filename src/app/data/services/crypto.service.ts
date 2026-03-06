import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  // ─── Par de claves RSA ───────────────────────────────────────────

  async generateKeyPair() {
    return crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  async exportPublicKey(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('spki', key);
    return this.bufferToBase64(exported);
  }

  async exportPrivateKey(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey('pkcs8', key);
    return this.bufferToBase64(exported);
  }

  async importPublicKey(base64: string) {
    const buffer = this.base64ToBuffer(base64);
    return crypto.subtle.importKey(
      'spki',
      buffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    );
  }

  async importPrivateKey(base64: string) {
    const buffer = this.base64ToBuffer(base64);
    return crypto.subtle.importKey(
      'pkcs8',
      buffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt'],
    );
  }

  // ─── Cifrar/descifrar privateKey con password (AES-GCM) ─────────

  async encryptPrivateKey(
    privateKeyBase64: string,
    password: string,
  ): Promise<{ encrypted: string; iv: string }> {
    const aesKey = await this.deriveAesKeyFromPassword(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(privateKeyBase64);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encoded,
    );

    return {
      encrypted: this.bufferToBase64(cipherBuffer),
      iv: this.bufferToBase64(iv),
    };
  }

  async decryptPrivateKey(
    encryptedBase64: string,
    ivBase64: string,
    password: string,
  ): Promise<string> {
    const aesKey = await this.deriveAesKeyFromPassword(password);
    const iv = this.base64ToBuffer(ivBase64);
    const cipherBuffer = this.base64ToBuffer(encryptedBase64);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      cipherBuffer,
    );

    return new TextDecoder().decode(decrypted);
  }

  // ─── Cifrar/descifrar RoomKey con RSA ────────────────────────────

  async encryptRoomKey(
    roomKeyBase64: string,
    publicKey: CryptoKey,
  ): Promise<string> {
    const encoded = new TextEncoder().encode(roomKeyBase64);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded,
    );
    return this.bufferToBase64(encrypted);
  }

  async decryptRoomKey(
    encryptedRoomKeyBase64: string,
    privateKey: CryptoKey,
  ): Promise<string> {
    const buffer = this.base64ToBuffer(encryptedRoomKeyBase64);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      buffer,
    );
    return new TextDecoder().decode(decrypted);
  }

  // ─── Cifrar/descifrar mensajes con AES-GCM ───────────────────────

  async encryptMessage(
    text: string,
    roomKeyBase64: string,
  ): Promise<{ encryptedText: string; iv: string }> {
    const aesKey = await this.importRoomKey(roomKeyBase64);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encoded,
    );

    return {
      encryptedText: this.bufferToBase64(cipherBuffer),
      iv: this.bufferToBase64(iv),
    };
  }

  async decryptMessage(
    encryptedTextBase64: string,
    ivBase64: string,
    roomKeyBase64: string,
  ): Promise<string> {
    const aesKey = await this.importRoomKey(roomKeyBase64);
    const iv = this.base64ToBuffer(ivBase64);
    const cipherBuffer = this.base64ToBuffer(encryptedTextBase64);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      cipherBuffer,
    );

    return new TextDecoder().decode(decrypted);
  }

  // ─── Generar RoomKey AES-256 ─────────────────────────────────────

  async generateRoomKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.bufferToBase64(exported);
  }

  // ─── Helpers privados ────────────────────────────────────────────

  private async deriveAesKeyFromPassword(password: string): Promise<CryptoKey> {
    const encoded = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoded,
      'PBKDF2',
      false,
      ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        // Salt fijo derivado del uso — en fase 2 usar salt único por usuario
        salt: new TextEncoder().encode('e2ee-salt-v1'),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private async importRoomKey(base64: string): Promise<CryptoKey> {
    const buffer = this.base64ToBuffer(base64);
    return crypto.subtle.importKey('raw', buffer, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt',
    ]);
  }

  bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
}
