import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseFormComponent } from '../../course-form/course-form.component';
import { Subject, debounceTime } from 'rxjs';


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
  instructor?: {
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
  };
  
}


@Component({
  selector: 'app-teachers-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseFormComponent],
  templateUrl: './teachers-courses.component.html',
  styleUrls: ['./teachers-courses.component.css']
})
export class TeachersCoursesComponent implements OnInit {
  courses: Course[] = [];
  errorMessage = '';
  currentPage = 1;
  selectedCategory: string = 'all';

  coursesPerPage = 6;
  isLoading = true;
  showCourseForm = false;
  selectedCourseId: number | null = null;
  searchSubject = new Subject<string>();
  searchText = '';

  constructor(private authService: AuthService, private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject.pipe(debounceTime(300)).subscribe(value => {
      this.searchText = value;
      this.currentPage = 1;
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCoursesByTeacher().subscribe({
      next: (res) => {
        this.courses = res.results || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error loading courses';
        this.isLoading = false;
      }
    });
  }

  filteredCourses(): Course[] {
  let filtered = this.courses;

  if (this.searchText) {
    const lower = this.searchText.toLowerCase();
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(lower) ||
      course.description.toLowerCase().includes(lower) ||
      course.category.toLowerCase().includes(lower)
    );
  }

  if (this.selectedCategory !== 'all') {
    filtered = filtered.filter(course => course.category === this.selectedCategory);
  }

  return filtered;
}


  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.coursesPerPage;
    return this.filteredCourses().slice(start, start + this.coursesPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCourses().length / this.coursesPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteCourse(id: number): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => this.loadCourses(),
        error: () => alert('Failed to delete course')
      });
    }
  }

  openCreateForm(): void {
    this.selectedCourseId = null;
    this.showCourseForm = true;
  }

  openEditForm(course: Course): void {
    this.selectedCourseId = course.id;
    this.showCourseForm = true;
  }

  closeCourseForm(): void {
    this.showCourseForm = false;
    this.loadCourses();
  }

  handleFormSubmit(): void {
    this.closeCourseForm();
  }
  getUniqueCategories(): string[] {
  const categories = this.courses.map(course => course.category);
  return Array.from(new Set(categories));
}

}
