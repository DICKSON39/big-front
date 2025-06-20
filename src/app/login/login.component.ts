import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs/operators';
import {AuthService,User} from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login({email, password})
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Login successful!';
          console.log('Login successful:', response);

          // Get the stored user data which includes the role
          this.authService.getUser().subscribe(
            (user: User | null) => {
              if (user && user.role_name) {
                // Route based on the user's role_name
                switch (user.role_name.toLowerCase()) { // Convert to lowercase for consistent comparison
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
                    // Fallback for unrecognised roles or if role_name is missing
                    console.warn('Unknown role_name, navigating to default dashboard.');
                    this.router.navigate(['/']); // Generic dashboard fallback
                    break;
                }
              } else {
                console.warn('User role not found after login, navigating to default dashboard.');
                this.router.navigate(['/']); // Fallback if user or role_name is null/undefined
              }
            },
            (error) => {
              console.error('Error fetching user data from AuthService:', error);
              this.router.navigate(['/']); // Fallback in case of error fetching user
            }
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials and try again.';
          console.error('Login error:', error.error || error);
        }
      });
  }
}
