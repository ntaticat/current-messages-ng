import { NgModule } from '@angular/core';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { SharedModule } from '../shared/shared.module';
import { ChatsPageComponent } from './pages/chats-page/chats-page.component';

@NgModule({
  declarations: [ChatsPageComponent, ChatPageComponent],
  imports: [ChatsRoutingModule, SharedModule],
})
export class ChatsModule {}
