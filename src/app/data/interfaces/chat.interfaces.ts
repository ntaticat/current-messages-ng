export interface IUser {
  id: string;
  fullName: string;
  chats?: IChat[];
}

export interface IChat {
  chatId: string;
  name: string;
  createdAt: Date;
  users?: IUser[];
  messages?: IChatMessage[];
}

export interface IChatPost {
  name: string;
}

export interface IChatMessage {
  chatMessageId: string;
  text: string;
  sentAt: Date;
  senderId: string;
}

export interface IChatMessagePost {
  chatId: string;
  message: string;
}

export interface IQuickMessage {
  quickMessageId: string;
  text: string;
}

export interface IQuickMessagePost {
  chatMessageId: string;
}

export interface IChatParticipantPost {
  guestId: string;
}
