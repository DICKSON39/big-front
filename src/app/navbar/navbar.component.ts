import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isAuthenticated: boolean = false;
  userName: string | null = null;
  userRole: string | null = null; // New property to store user's role
  dashboardLink: string = '/dashboard'; // New property for dynamic dashboard link

  private authSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.getUser().pipe(
      map(user => {
        this.isAuthenticated = !!user;
        this.userName = user ? user.first_name : null;
        this.userRole = user ? user.role_name : null; // Store the role name

        // Determine the dashboard link based on role
        if (user && user.role_name) {
          switch (user.role_name.toLowerCase()) {
            case 'admin':
              this.dashboardLink = '/admin';
              break;
            case 'teacher':
              this.dashboardLink = '/teacher';
              break;
            case 'student': // Assuming 'user' role is 'student' or similar
            case 'user':
              this.dashboardLink = '/user';
              break;
            default:
              this.dashboardLink = '/dashboard'; // Fallback
              break;
          }
        } else {
          this.dashboardLink = '/dashboard'; // Default if no user or role
        }

        return this.isAuthenticated;
      })
    ).subscribe();

    // Initial check (in case subscription hasn't emitted yet)
    this.isAuthenticated = this.authService.isAuthenticated();
    this.authService.getUser().subscribe(user => {
      this.userName = user ? user.first_name : null;
      this.userRole = user ? user.role_name : null;
      // Re-evaluate dashboard link on direct fetch
      if (user && user.role_name) {
        switch (user.role_name.toLowerCase()) {
          case 'admin': this.dashboardLink = '/admin'; break;
          case 'teacher': this.dashboardLink = '/teacher'; break;
          case 'student': case 'user': this.dashboardLink = '/user'; break;
          default: this.dashboardLink = '/dashboard'; break;
        }
      } else {
        this.dashboardLink = '/dashboard';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.userName = null;
    this.userRole = null; // Clear role on logout
    this.dashboardLink = '/dashboard'; // Reset dashboard link on logout
    this.router.navigate(['/']);
  }
}
