import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-verify-reset-otp',
  templateUrl: './verify-reset-otp.component.html',
  imports:[CommonModule,ReactiveFormsModule],
  styleUrls: ['./verify-reset-otp.component.css']
})
export class VerifyResetOtpComponent implements OnInit {
  verifyOtpForm!: FormGroup;
  email: string | null = null; // To store the email passed from forgot-password
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // To get query parameters
  ) { }

  ngOnInit(): void {
    this.verifyOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // 6-digit OTP
    });

    // Get the email from query parameters (passed from ForgotPasswordComponent)
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || null;
      if (!this.email) {
        this.errorMessage = 'Email not found. Please go back to forgot password.';
      }
    });
  }

  get f() { return this.verifyOtpForm.controls; } // Convenience getter

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.verifyOtpForm.invalid) {
      this.verifyOtpForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Cannot verify OTP: Email is missing.';
      return;
    }

    this.isLoading = true;
    const otp = this.verifyOtpForm.value.otp;

    this.authService.verifyPasswordResetOtp(this.email, otp)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'OTP verified successfully!';
          console.log('Password Reset OTP verified:', response);

          // *** CRITICAL STEP: Navigate to ResetPasswordComponent ***
          // Pass the email and the passwordResetToken to the next component
          this.router.navigate(['/reset-password'], {
            queryParams: { email: this.email, token: response.passwordResetToken }
            // Alternatively, use history.state if you prefer not to expose in URL:
            // state: { email: this.email, token: response.passwordResetToken }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to verify OTP. Please try again.';
          console.error('Password Reset OTP verification error:', error.error);
        }
      });
  }


   onResendOtp(): void {
    // Similar to onResend in OtpVerificationComponent, but calls requestPasswordReset
   if (!this.email) {
       this.errorMessage = 'Cannot resend OTP: Email is missing.';
       return;
     }
     this.isLoading = true;
     this.authService.requestPasswordReset(this.email)
       .pipe(finalize(() => this.isLoading = false))
       .subscribe({
         next: (response) => {
          this.successMessage = response.message || 'New OTP sent to your email!';
         },
         error: (error: HttpErrorResponse) => {
           this.errorMessage = error.error?.message || 'Failed to resend OTP.';
        }
       });
   }
}
