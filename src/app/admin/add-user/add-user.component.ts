import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { AuthService } from '../../../services/auth.service'; // Adjust path based on your structure
import {Router, RouterLink} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Import ReactiveFormsModule for formGroup
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {
  addUserForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;
  roles: string[] = ['user', 'teacher', 'admin']; // Available roles for creation

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role_name: [this.roles[0], Validators.required] // Default to first role, e.g., 'student'
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.addUserForm.controls; }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;

    this.authService.addUser(this.addUserForm.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'User added successfully!';
          this.addUserForm.reset({
            role_name: this.roles[0] // Reset form, keep default role
          });
          // Optional: navigate back to admin dashboard or user list after success
          // setTimeout(() => {
          //   this.router.navigate(['/admin']);
          // }, 2000);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Failed to add user. Please try again.';
          console.error('Add user error:', error);
        }
      });
  }
}
