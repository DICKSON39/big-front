import { Component, OnInit } from '@angular/core';
import { CommonModule,Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService, UpdateUserBackendResponse, UpdateUserRequest, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUser().subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }

        this.currentUser = user;

        // Patch form with current user data
        this.profileForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          
        });

        this.profileForm.disable(); // Start in view mode
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadUserProfile(); 
    }
    this.clearMessages();
  }

  onSubmit(): void {
    this.clearMessages();
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please correct the highlighted errors.';
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'User ID not found for profile update.';
      return;
    }

    const updatedData: UpdateUserRequest = this.profileForm.value;

    this.authService.updateProfile(this.currentUser.id, updatedData).subscribe({
      next: (response: UpdateUserBackendResponse) => {
        this.successMessage = response.message;
        // The service already stores the updated user in localStorage
        this.loadUserProfile(); // Re-load to update UI with new data and disable form
        this.isEditing = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Profile update failed:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Helper for form validation
  hasError(controlName: string, errorType: string): boolean | undefined {
    const control = this.profileForm.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }

  goBack():void{
    this.location.back();
  }
}
