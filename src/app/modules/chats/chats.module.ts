import { NgModule } from '@angular/core';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatComponent } from './chat/chat.component';
import { SharedModule } from '../shared/shared.module';
import { ChatsPageComponent } from './pages/chats-page/chats-page.component';

@NgModule({
  declarations: [ChatsPageComponent, ChatComponent],
  imports: [ChatsRoutingModule, SharedModule],
})
export class ChatsModule {}
