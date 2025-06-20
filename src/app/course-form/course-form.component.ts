import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '../../services/course.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {
  @Input() courseId: number | null = null;
  @Output() closeModal = new EventEmitter<void>(); // CHANGED THIS LINE: Renamed 'close' to 'closeModal'
  courseForm!: FormGroup;
  imagePreviewUrl: string | null = null;

  existingImage: string | null = null;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', Validators.required],
      image_url: [null], // allow null here
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      teacherId: ['']
    });

    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe(course => {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          duration: course.duration,
          category: course.category,
          price: course.price,
          teacherId: course.teacherId
        });

        // Optional: preview old image
        this.existingImage = course.image_url;
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.snackBar.open('❌ Please fill out the form correctly!', 'Close', {
        duration: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', this.courseForm.get('title')?.value);
    formData.append('description', this.courseForm.get('description')?.value);
    formData.append('price', this.courseForm.get('price')?.value);
    formData.append('teacher_id', this.courseForm.get('teacherId')?.value || '');
    formData.append('duration', this.courseForm.get('duration')?.value);
    formData.append('category', this.courseForm.get('category')?.value);

    const imageFile = this.courseForm.get('image_url')?.value;
    if (imageFile && imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    const action$ = this.courseId
      ? this.courseService.updateCourse(this.courseId, formData)
      : this.courseService.createCourse(formData);

    action$.subscribe({
      next: () => {
        this.snackBar.open(
          this.courseId ? '✅ Course updated!' : '✅ Course created!',
          'Close',
          { duration: 3000 }
        );
        this.closeModal.emit(); // CHANGED THIS LINE: Emitting 'closeModal'
      },
      error: () => {
        this.snackBar.open('❌ Something went wrong', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.courseForm.patchValue({ image_url: file });
    }
  }
}