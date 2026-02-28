import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IRegisterPost } from 'src/app/data/interfaces/auth.interfaces';
import { AuthService } from 'src/app/data/services/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
})
export class SignupPageComponent implements OnInit {
  registerForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private api: AuthService,
  ) {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.invalid) {
      alert('El formulario no es valido');
      return;
    }

    const fullName = this.registerForm.get('fullName')?.value;
    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    const data: IRegisterPost = {
      fullName,
      email,
      password,
    };

    this.api.register(data).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/login');
      },
      error: (err) => {
        alert('No se pudo registrar el usuario');
        console.error(err);
      },
    });
  }
}
