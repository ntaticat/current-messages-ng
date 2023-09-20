export interface IChat {
  chatId: string;
  users: IUser[];
  messages: IChatMessage[];
}

export interface IChatMessage {
  chatMessageId: string;
  messageText: string;
  sentDate?: Date;
  userId: string;
  chatOwnerId: string;
}

export interface IUser {
  userId: string;
  name: string;
  chats: IChat[];
}

export interface IChatMessagePost {
  messageText: string;
  userId: string;
  chatOwnerId: string;
  setAsCurrentMessage: boolean;
}

export interface ICurrentMessage {
  currentMessageId: string;
  messageText: string;
  userId: string;
}