// src/app/register/register.component.ts
import { Component,OnInit } from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse for better error typing

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit { // Add OnInit if you use ngOnInit
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;


  constructor(private fb: FormBuilder,private router:Router,private authService:AuthService) { // Use consistent casing for AuthService instance
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
    this.errorMessage = null; // Clear previous errors
    this.successMessage = null; // Clear previous success messages

    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({ // Use 'authService' for consistency
        next: (response) => {
          this.successMessage = response.message;
          console.log('Registration successful:', response);

          // *** DIAGNOSTIC LOG HERE ***
          const userIdAfterRegister = localStorage.getItem('userId');
          console.log('RegisterComponent - userId in localStorage after registration:', userIdAfterRegister);
          // You should see a valid user ID string here if AuthService is working correctly.

          this.router.navigate(['/otp-verification']);
        },
        error: (error: HttpErrorResponse) => { // Type error for better error handling
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          console.error('Registration error:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      // Mark all controls as touched to display validation errors
      this.registerForm.markAllAsTouched();
    }
  }
}
