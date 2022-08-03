import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    CommonModule,
    ChatsRoutingModule,
    SharedModule
  ]
})
export class ChatsModule { }
