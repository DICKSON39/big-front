import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { FormsModule } from '@angular/forms';

export interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  duration: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  teacher_id?: number;
}

export interface PaginatedCourseResponse {
  message: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCourses: number;
  results: Course[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  isAuthenticated: boolean = false;
  private authSubscription!: Subscription;
  featuredCourses: Course[] = [];
  newsletterEmail: string = '';

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.getUser().subscribe((user) => {
      this.isAuthenticated = !!user;
    });

    this.fetchFeaturedCourses();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  fetchFeaturedCourses(): void {
    this.courseService.getCourses(1, 10).subscribe({
      next: (response) => {
        if (response && response.results) {
          this.featuredCourses = response.results.slice(0, 3); // ✅ Now accessing the correct key
        } else {
          console.warn('Unexpected course response:', response);
          this.featuredCourses = [];
        }
      },
      error: (err) => {
        console.error('Failed to fetch courses:', err);
        this.featuredCourses = [];
      },
    });
  }

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      alert(`Subscribed with: ${this.newsletterEmail} 🎉`);
      this.newsletterEmail = '';
    }
  }
}
