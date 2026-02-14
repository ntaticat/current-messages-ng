import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatsPageComponent } from './pages/chats-page/chats-page.component';

const routes: Routes = [
  {
    path: '',
    component: ChatsPageComponent,
  },
  {
    path: ':id',
    component: ChatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatsRoutingModule {}
