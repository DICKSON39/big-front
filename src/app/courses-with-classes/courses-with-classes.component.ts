import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-courses-with-classes',
  templateUrl: './courses-with-classes.component.html',
  styleUrls: ['./courses-with-classes.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class CoursesWithClassesComponent implements OnInit {
  courses: any[] = [];
  isLoading = true;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getCoursesWithClasses().subscribe({
      next: (res) => {
        this.courses = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        alert('Failed to load courses with classes');
        this.isLoading = false;
      }
    });
  }
}
