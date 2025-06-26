import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalComponent],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;
  showModal = false;
  pendingLoginData: { email: string; password: string } | null = null;

  modalMessage = 'Login failed. Please try again.';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onLogin(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid email and password.';
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    // Store login data and show modal confirmation first
    this.pendingLoginData = { email, password };
    this.modalMessage = 'Are you sure you want to log in?';
    this.showModal = true;
  }

  onModalConfirm(): void {
    this.showModal = false;

    if (!this.pendingLoginData) return;

    this.isLoading = true;

    this.authService
      .login(this.pendingLoginData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Login successful!';

          this.authService.getUser().subscribe(
            (user: User | null) => {
              if (user && user.role_name) {
                switch (user.role_name.toLowerCase()) {
                  case 'admin':
                    this.router.navigate(['/admin']);
                    break;
                  case 'teacher':
                    this.router.navigate(['/teacher']);
                    break;
                  case 'user':
                    this.router.navigate(['/student']);
                    break;
                  default:
                    this.router.navigate(['/']);
                }
              } else {
                this.router.navigate(['/']);
              }
            },
            (error) => {
              console.error(
                'Error fetching user data from AuthService:',
                error,
              );
              this.router.navigate(['/']);
            },
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.error?.message ||
            'Login failed. Please check your credentials.';
          this.modalMessage =
            this.errorMessage ?? 'Login failed. Please try again.';
          this.showModal = true;
          console.error('Login error:', error);
        },
      });

    this.pendingLoginData = null; // Clear after login attempt
  }

  onModalCancel(): void {
    this.pendingLoginData = null;
    this.showModal = false;
  }
}
