// src/app/otp-verification/otp-verification.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http'; // Keep HttpErrorResponse for type checking
 // Import your AuthService
import { finalize } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service'; // Import finalize for consistent loading state management

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
  otpForm!: FormGroup;
  userId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Inject AuthService instead of HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || localStorage.getItem('userId');
      console.log('OTP Component - Retrieved userId:', this.userId);

      if (!this.userId) {
        this.errorMessage = 'User ID not found. Please register or log in again.';
        // Optionally redirect if userId is absolutely required:
        // this.router.navigate(['/register']);
      }
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  get f() {
    return this.otpForm.controls;
  }

  onVerify(): void {

    console.log('FRONTEND DEBUG: onVerify() function triggered!');
    this.errorMessage = null;
    this.successMessage = null;

    if (this.otpForm.invalid) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'Cannot verify OTP: User ID is missing.';
      return;
    }

    this.isLoading = true; // Show loading indicator

    const { otp } = this.otpForm.value;

    this.authService.verifyOtp(this.userId, otp)
      .pipe(
        finalize(() => {
          this.isLoading = false; // Hide loading indicator regardless of success or error
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'OTP verified successfully!';
          console.log('OTP verified successfully:', response);
          // Redirect to login or dashboard upon successful verification
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to verify OTP. Please try again.';
          console.error('OTP verification error (backend):', error.error);
        }
      });
  }

  onResend(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.userId) {
      this.errorMessage = 'Cannot resend OTP: User ID is missing.';
      return;
    }

    this.isLoading = true; // Show loading indicator

    this.authService.resendOtp(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading = false; // Hide loading indicator regardless of success or error
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'OTP resent successfully! Check your email.';
          console.log('Resend OTP successful:', response);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
          console.error('Resend OTP error (backend):', error.error);
        }
      });
  }
}
