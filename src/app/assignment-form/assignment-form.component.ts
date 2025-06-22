import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { AssignmentService } from '../../services/assignment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './assignment-form.component.html',
  styleUrls: ['./assignment-form.component.css']
})
export class AssignmentFormComponent implements OnInit {
  assignmentForm!: FormGroup;
  courses: any[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    public dialogRef: MatDialogRef<AssignmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { preselectedCourseId: number | null }
  ) {}

  ngOnInit(): void {
    this.assignmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required],
      course_id: ['', Validators.required],
    });

    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService.getAllCoursesForDropdown().subscribe({
      next: (res: any) => {
        this.courses = res.data || res;

        if (this.data?.preselectedCourseId) {
          this.assignmentForm.patchValue({ course_id: this.data.preselectedCourseId });
        }
      },
      error: () => {
        this.snackBar.open('Failed to load courses', 'Close', { duration: 3000 });
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

 onSubmit(e: Event): void {
  e.preventDefault();

  if (this.assignmentForm.invalid) {
    this.snackBar.open('Please fill out all required fields.', 'Close', { duration: 3000 });
    return;
  }

  const payload = {
    title: this.assignmentForm.get('title')?.value,
    description: this.assignmentForm.get('description')?.value,
    due_date: this.assignmentForm.get('due_date')?.value,
    course_id: this.assignmentForm.get('course_id')?.value,
  };

  const courseId = payload.course_id;

  this.assignmentService.createAssignment(courseId, payload).subscribe({
    next: (res) => {
      this.snackBar.open(res.message || '✅ Assignment created!', 'Close', { duration: 3000 });
      this.dialogRef.close(true);
    },
    error: (err) => {
      this.snackBar.open(err.error?.message || '❌ Failed to create assignment', 'Close', { duration: 3000 });
    },
  });
}


  onClose(): void {
    this.dialogRef.close(); // just close without doing anything
  }
}
