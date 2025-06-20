import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {Router, RouterLink} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common'; // For loading state

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports:[CommonModule,ReactiveFormsModule,RouterLink],
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotPasswordForm.controls; } // Convenience getter

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.requestPasswordReset(email)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Password reset OTP sent. Check your email!';
          console.log('Password reset request successful:', response);
          // You might want to navigate to a new page to enter the OTP
          this.router.navigate(['/verify-reset-otp'], { queryParams: { email: email } });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to request password reset. Please try again.';
          console.error('Password reset request error:', error);
        }
      });
  }
}
