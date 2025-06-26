// src/app/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse for better error typing
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, ModalComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  // Add OnInit if you use ngOnInit
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showModal = false;
  modalMessage = 'Are you sure you want to register?';
  pendingFormData: any = null;
  showConfirmButtons = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    // Use consistent casing for AuthService instance
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      inviteCode: [''],
      roleId: [null], // roleId will be managed by backend based on inviteCode or default
    });
  }

  ngOnInit(): void {
    // You can put initialization logic here if needed.
    // For this component, constructor is fine for form setup.
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.valid) {
      this.pendingFormData = this.registerForm.value;
      this.modalMessage =
        'Are you sure you want to register with these details?';
      this.showConfirmButtons = true; // show yes/cancel
      this.showModal = true;
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.registerForm.markAllAsTouched();
    }
  }

  onModalConfirm(): void {
    this.showModal = false;

    if (!this.pendingFormData) return;

    this.authService.register(this.pendingFormData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.router.navigate(['/otp-verification']);
      },
      error: (error: HttpErrorResponse) => {
        this.modalMessage =
          error.error?.message || 'Registration failed. Please try again.';
        this.showConfirmButtons = false; // only show close btn
        this.showModal = true; // show error modal
      },
    });

    this.pendingFormData = null;
  }

  onModalCancel(): void {
    this.showModal = false;
    this.pendingFormData = null;
  }
}
