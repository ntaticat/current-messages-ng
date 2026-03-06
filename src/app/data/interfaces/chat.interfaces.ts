export interface IUser {
  id: string;
  fullName: string;
  chats?: IChat[];
  hasKeys: boolean;
  publicKey: string;
  encryptedPrivateKey: string;
}

export interface IPublicKey {
  publicKey: string;
}

export interface IChatRoomKey {
  roomKey: string;
}

export interface IChat {
  id: string;
  name: string;
  createdAt: Date;
  participants: IParticipant[];
  messages?: IChatMessage[];
  hasRoomKey: boolean;
}

export interface IParticipant {
  id: string;
  fullName: string;
  hasKeys: boolean;
  role: string;
  joinedAt: Date;
  lastReadAt: Date;
}

export interface IChatPost {
  name: string;
  encryptedRoomKey: string;
}

export interface IChatMessage {
  id: string;
  sentAt: Date;
  userId: string;
  text?: string;
  encryptedText: string;
  iv: string;
}

export interface IChatMessagePost {
  chatId: string;
  encryptedText: string;
  iv: string;
}

export interface IQuickMessage {
  id: string;
  text: string;
}

export interface IQuickMessagePost {
  chatMessageId: string;
}

export interface IChatParticipantPost {
  guestId: string;
  encryptedRoomKeyForGuest: string;
}
