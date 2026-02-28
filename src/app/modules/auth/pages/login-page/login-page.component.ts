import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ILoginPost } from 'src/app/data/interfaces/auth.interfaces';
import { AuthService } from 'src/app/data/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
})
export class LoginPageComponent implements OnInit {
  loginForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
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
    if (this.loginForm.invalid) {
      alert('El formulario no es valido');
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    const credentials: ILoginPost = {
      email,
      password,
    };

    this.api.login(credentials).subscribe({
      next: () => {
        this.router.navigateByUrl('/chats');
      },
      error: (err) => {
        alert('No se pudo iniciar sesión');
        console.error(err);
      },
    });
  }
}
