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
