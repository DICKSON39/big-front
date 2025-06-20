import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { Router } from '@angular/router'; 
import { CourseFormComponent } from '../../course-form/course-form.component';
import { ModalComponent } from '../../modal/modal.component';
import { Subject, debounceTime } from 'rxjs';
import { Course } from '../../course-details/course-details.component';
import { ClassFormComponent } from '../../class-form/class-form.component';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    CommonModule,
    
    FormsModule,
    CourseFormComponent,
    ClassFormComponent,

    
  ],
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.css']
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  errorMessage = '';
  isLoading = true;
  showClassForm = false;
selectedCourseForClass: number | null = null;
  showCourseForm = false;
  selectedCourseId: number | null = null;

  searchText = '';
  selectedCategory = 'all';
  searchSubject = new Subject<string>();

  currentPage = 1;
  coursesPerPage = 6;

  constructor(private courseService: CourseService,private router:Router) {}

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject.pipe(debounceTime(300)).subscribe(value => {
      this.searchText = value;
      this.currentPage = 1;
    });
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
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

  getUniqueCategories(): string[] {
    const categories = this.courses.map(course => course.category);
    return Array.from(new Set(categories));
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

 goToClasses(courseId: number): void {
  this.router.navigate([`/admin/courses/${courseId}/classes`]); 
}

openClassForm(courseId?: number): void {
  this.selectedCourseForClass = courseId || null;
  this.showClassForm = true;
}
closeClassForm(): void {
  this.showClassForm = false;
  this.selectedCourseForClass = null;
  // Optional: reload if needed
}


}
