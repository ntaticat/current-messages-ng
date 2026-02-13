import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LoginPageComponent, SignupPageComponent],
  imports: [CommonModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
