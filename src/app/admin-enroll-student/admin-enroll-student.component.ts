import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-admin-enroll-student',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-enroll-student.component.html',
  styleUrls: ['./admin-enroll-student.component.css']
})
export class AdminEnrollStudentComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  enrollForm!: FormGroup;
  students: any[] = [];
  courses: any[] = [];
  searchTerm = '';
  searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.enrollForm = this.fb.group({
      user_id: ['', Validators.required],
      course_id: ['', Validators.required],
    });

    this.fetchCourses();

    // 🔁 Debounced student search
    this.searchSubject.pipe(debounceTime(300)).subscribe(value => {
      this.searchTerm = value;
      this.fetchStudents();
    });

    this.fetchStudents();
  }

  fetchStudents(): void {
    this.userService.getAllStudents(this.searchTerm).subscribe({
      next: (res) => {
        this.students = res.students;
      },
      error: () => {
        this.snackBar.open('Error loading students', 'Close', { duration: 3000 });
      }
    });
  }

  fetchCourses(): void {
    this.courseService.getAllCoursesForDropdown().subscribe({
      next: (res) => {
        this.courses = res.data || res;
      },
      error: () => {
        this.snackBar.open('Error loading courses', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.enrollForm.invalid) {
      this.snackBar.open('Please select both student and course.', 'Close', { duration: 3000 });
      return;
    }

    this.enrollmentService.enrollStudent(this.enrollForm.value).subscribe({
      next: (res) => {
        this.snackBar.open('Student enrolled successfully!', 'Close', { duration: 3000 });
        this.enrollForm.reset(); // ✅ Reset form
        this.close.emit();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Enrollment failed', 'Close', { duration: 3000 });
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  // ✅ Used in ngFor for performance
  trackById(index: number, item: any): number {
    return item.id;
  }
}
