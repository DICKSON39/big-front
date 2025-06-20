import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClassService } from '../../services/class.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-courses-classes',
  templateUrl: './admin-courses-classes.component.html',
  styleUrls: ['./admin-courses-classes.component.css'],
  imports: [CommonModule,FormsModule],
})
export class AdminCourseClassesComponent implements OnInit {
  courseId!: number;
  classes: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = Number(params.get('courseId'));
      if (this.courseId) {
        this.loadClasses();
      }
    });
  }

  loadClasses(): void {
    this.isLoading = true;
    this.classService.getClassesByCourseId(this.courseId).subscribe({
      next: (res) => {
        this.classes = res.classes || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // optionally show a toast/snackbar
      }
    });
  }
}
