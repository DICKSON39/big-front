import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

@Component({
  selector: 'app-student-course-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-course-progress.component.html',
  styleUrls: ['./student-course-progress.component.css'],
})
export class StudentCourseProgressComponent implements OnInit {
  courses: any[] = [];
  isLoading = true;
  errorMessage = '';
  selectedClass: any = null;
selectedCourse: any = null;


  constructor(
    private progressService: ProgressService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.getUserId().pipe(take(1)).subscribe({
      next: (userId) => {
        if (!userId) {
          this.errorMessage = 'User not found';
          this.isLoading = false;
          return;
        }

        this.fetchProgress(userId);
      },
      error: () => {
        this.errorMessage = 'Error fetching user ID';
        this.isLoading = false;
      },
    });
  }

  fetchProgress(userId: string): void {
    this.isLoading = true;
    this.progressService.getCoursesWithClasses(userId).subscribe({
      next: (res) => {
        this.courses = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load progress';
        this.isLoading = false;
      },
    });
  }

  getProgressPercent(course: any): number {
    if (!course.classes || course.classes.length === 0) return 0;

    const completed = course.classes.filter((cls: any) => cls.is_completed).length;
    return Math.round((completed / course.classes.length) * 100);
  }

  markAsComplete(classId: number, course: any): void {
    this.authService.getUserId().pipe(take(1)).subscribe({
      next: (userId) => {
        if (!userId) {
          this.snackBar.open('User not logged in', 'Close', { duration: 3000 });
          return;
        }

        this.progressService.markClassComplete(userId, classId).subscribe({
          next: (res) => {
            this.snackBar.open(res.message || 'Marked as completed!', 'Close', { duration: 3000 });

            const cls = course.classes.find((c: any) => c.id === classId);
            if (cls) {
              cls.is_completed = true;
            }
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Failed to mark as complete', 'Close', {
              duration: 3000,
            });
          },
        });
      },
      error: () => {
        this.snackBar.open('Error fetching user ID', 'Close', { duration: 3000 });
      },
    });
  }

  watchClass(cls: any): void {
  this.selectedClass = cls;
  this.selectedCourse = this.courses.find(course =>
    course.classes.some((c: any) => c.id === cls.id)
  );
}

closeVideo(): void {
  this.selectedClass = null;
  this.selectedCourse = null;
}

toggleCourse(course: any): void {
  course.showClasses = !course.showClasses;
}

onVideoEnded(classId: number, course: any): void {
  this.markAsComplete(classId, course);
}

shouldShowCertificate(course: any): boolean {
  return this.getProgressPercent(course) === 100 && !!course.certificate?.certificate_url;
}


}
