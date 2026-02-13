import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ILoginPost } from 'src/app/data/interfaces/auth.interfaces';
import { AuthService } from 'src/app/data/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private api: AuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    console.log('onSubmitLogin');

    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      const credentials: ILoginPost = {
        email,
        password,
      };

      this.api.login(credentials).subscribe(() => {
        this.router.navigateByUrl('/chats');
      });
    }
  }
}
