import { Routes } from '@angular/router';
import { ChatsPageComponent } from './pages/chats-page/chats-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';

export const CHATS_ROUTES: Routes = [
  { path: '', component: ChatsPageComponent },
  { path: ':chatId', component: ChatPageComponent },
];
