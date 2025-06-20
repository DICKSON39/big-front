import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { EnrollmentService } from '../../../services/enrollment.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-enrolled-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrolled-students.component.html',
  styleUrls: ['./enrolled-students.component.css'],
})
export class EnrolledStudentsComponent implements OnInit {
  studentsWithCourses: any[] = [];
  isLoading = true;
  students: any[] = [];
  errorMessage = '';
  searchTerm = '';
  searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEnrolledStudents();

    this.searchSubject.pipe(debounceTime(300)).subscribe(value => {
      this.searchTerm = value;
      this.loadEnrolledStudents();
    });
  }

  loadEnrolledStudents(): void {
    this.isLoading = true;
    this.userService.getStudentsWithCourses(this.searchTerm).subscribe({
      next: (res) => {
        console.log('Enrolled students response:', res);
        this.studentsWithCourses = res.students || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load enrolled students';
        this.isLoading = false;
      },
    });
  }

  unenrollStudent(userId: number, courseId: number): void {
  if (confirm('Are you sure you want to unenroll this student from the course?')) {
    this.enrollmentService.unenrollStudent(userId, courseId).subscribe({
      next: () => {
        this.snackBar.open('Unenrolled successfully', 'Close', { duration: 3000 });
        this.loadEnrolledStudents();
      },
      error: () => {
        this.snackBar.open('Failed to unenroll student', 'Close', { duration: 3000 });
      },
    });
  }
}

}
