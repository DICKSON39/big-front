import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '../../services/course.service';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-class-form',
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css'],
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  standalone: true,
})
export class ClassFormComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>(); // This is the EventEmitter output
  classForm!: FormGroup;
  courses: any[] = [];

  @Input() preselectedCourseId: number | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private courseService: CourseService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.classForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      course_id: ['', Validators.required],
    });

    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService.getAllCoursesForDropdown().subscribe({
      next: (res: any) => {
        this.courses = res.data || res;

        if (this.preselectedCourseId) {
          this.classForm.patchValue({ course_id: this.preselectedCourseId });
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

    if (this.classForm.invalid || !this.selectedFile) {
      this.snackBar.open('Please fill out the form correctly.', 'Close', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('title', this.classForm.get('title')?.value);
    formData.append('description', this.classForm.get('description')?.value);
    formData.append('course_id', this.classForm.get('course_id')?.value);
    formData.append('file', this.selectedFile);

    this.classService.createClass(formData).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Class created successfully!', 'Close', {
          duration: 3000,
        });
        this.closeModal.emit(); // Emit the event
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to create class', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // RENAMED THIS METHOD: From 'closeModal()' to 'onClose()'
  onClose(): void {
    this.closeModal.emit(); // Emit the event
  }
}
