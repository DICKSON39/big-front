import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  duration: string;
  category: string;
  price: number;
  instructor: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,NavbarComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  categories: string[] = []; // dynamic from response
  searchTerm: string = '';
  selectedCategory: string = '';

  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 6;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService
      .getCourses(this.currentPage, this.limit, this.searchTerm, this.selectedCategory)
      .subscribe((res) => {
        this.courses = res.results;
        this.totalPages = res.totalPages;
        this.extractCategories(res.results);
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchCourses();
  }

  onFilterCategory(): void {
    this.currentPage = 1;
    this.fetchCourses();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchCourses();
    }
  }

  private extractCategories(courses: Course[]): void {
    const unique = new Set(courses.map(course => course.category));
    this.categories = Array.from(unique);
  }
}
