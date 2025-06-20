import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-class-viewer',
  templateUrl: './class-viewer.component.html',
  styleUrls: ['./class-viewer.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ClassViewerComponent implements OnInit {
  courseId!: number;
  courseTitle = '';
  classes: any[] = [];
  isLoading = true;

  editingClass: any = null;
  selectedEditFile: File | null = null;
  editForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private classService: ClassService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    if (!this.courseId) {
      this.router.navigate(['/teacher/courses-with-classes']);
    } else {
      this.loadClasses();
    }

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadClasses(): void {
    this.isLoading = true;

    this.courseService.getSingleCourseWithClasses(this.courseId).subscribe({
      next: (res) => {
        this.courseTitle = res.course_title;
        this.classes = res.classes || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load class info', 'Close', { duration: 3000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses-with-classes']);
  }

  deleteClass(id: number): void {
    if (confirm('Are you sure you want to delete this class?')) {
      this.classService.deleteClass(id).subscribe({
        next: () => {
          this.snackBar.open('Class deleted', 'Close', { duration: 3000 });
          this.loadClasses();
        },
        error: () => {
          this.snackBar.open('Failed to delete class', 'Close', { duration: 3000 });
        }
      });
    }
  }

  startEdit(cls: any): void {
    this.editingClass = cls;
    this.editForm.patchValue({
      title: cls.title,
      description: cls.description
    });
  }

  onEditFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedEditFile = input.files[0];
    }
  }

  submitEdit(e: Event): void {
    e.preventDefault();

    if (!this.editingClass || this.editForm.invalid) return;

    const formData = new FormData();
    formData.append('title', this.editForm.get('title')?.value);
    formData.append('description', this.editForm.get('description')?.value);
    if (this.selectedEditFile) {
      formData.append('file', this.selectedEditFile);
    }

    this.classService.updateClass(this.editingClass.id, formData).subscribe({
      next: () => {
        this.snackBar.open('Class updated successfully', 'Close', { duration: 3000 });
        this.loadClasses();
        this.cancelEdit();
      },
      error: () => {
        this.snackBar.open('Failed to update class', 'Close', { duration: 3000 });
      }
    });
  }

  cancelEdit(): void {
    this.editingClass = null;
    this.editForm.reset();
    this.selectedEditFile = null;
  }
}
