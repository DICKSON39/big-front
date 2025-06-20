import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ReactiveFormsModule} from '@angular/forms';

import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';

// Custom validator to check if passwords match
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null; // Don't validate if fields are empty
    }

    return password === confirmPassword ? null : { 'passwordMismatch': true };
  };
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports:[CommonModule,ReactiveFormsModule,RouterLink]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  email: string | null = null;
  passwordResetToken: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || null;
      this.passwordResetToken = params['token'] || null;

      if (!this.email || !this.passwordResetToken) {
        this.errorMessage = 'Invalid link. Please restart the password reset process.';
        // Optionally redirect to forgot-password
        // this.router.navigate(['/forgot-password']);
      }
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator() }); // Apply custom validator at form group level
  }

  get f() { return this.resetPasswordForm.controls; } // Convenience getter

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.errorMessage = 'Please fix the errors in the form.';
      return;
    }

    if (!this.email || !this.passwordResetToken) {
      this.errorMessage = 'Missing email or reset token. Please restart the password reset process.';
      return;
    }

    this.isLoading = true;
    const newPassword = this.resetPasswordForm.value.newPassword;

    this.authService.resetPassword(this.email, newPassword, this.passwordResetToken)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Password reset successful!';
          console.log('Password reset successful:', response);
          // Redirect to login page after successful reset
          this.router.navigate(['/login'], { queryParams: { passwordReset: 'success' } });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
          console.error('Password reset error:', error.error);
        }
      });
  }
}
