import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
 // Adjust path if needed
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-course-details',
  imports: [CommonModule,FormsModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css',
  standalone: true,
})
export class CourseDetailsComponent {

   courseId!: number;
    course!: Course;
    isLoading = true;
    errorMessage = '';
  
    constructor(
      private route: ActivatedRoute,
      private courseService: CourseService
    ) {}
  
    ngOnInit(): void {
      this.courseId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.courseId) {
        this.fetchCourseDetails(this.courseId);
      } else {
        this.errorMessage = 'Invalid course ID.';
        this.isLoading = false;
      }
    }
  
    fetchCourseDetails(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (data) => {
        this.course = data.course; // ✅ fix here
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load course.';
        this.isLoading = false;
      },
    });
  }
  

}