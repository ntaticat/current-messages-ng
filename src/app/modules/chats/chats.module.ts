import { NgModule } from '@angular/core';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { SharedModule } from '../shared/shared.module';
import { ChatsPageComponent } from './pages/chats-page/chats-page.component';
import { NewChatModalComponent } from './pages/chats-page/new-chat-modal/new-chat-modal.component';
import { NewUserModalComponent } from './pages/chat-page/new-user-modal/new-user-modal.component';

@NgModule({
  declarations: [ChatsPageComponent, ChatPageComponent, NewChatModalComponent, NewUserModalComponent],
  imports: [ChatsRoutingModule, SharedModule],
})
export class ChatsModule {}
