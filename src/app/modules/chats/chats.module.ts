import { NgModule } from '@angular/core';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatsComponent } from './chats.component';
import { ChatComponent } from './chat/chat.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ChatsComponent,
    ChatComponent
  ],
  imports: [
    ChatsRoutingModule,
    SharedModule
  ]
})
export class ChatsModule { }
