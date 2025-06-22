import { Component, OnInit } from '@angular/core';
import { AssignmentService } from '../../services/assignment.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-assignments',
  templateUrl: './student-assignments.component.html',
  imports: [CommonModule, FormsModule],
})
export class StudentAssignmentsComponent implements OnInit {
  assignments: any[] = [];
  userId!: string;
  courseId!: number;

  constructor(
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.courseId = +courseIdParam;

      this.authService.getUserId().subscribe((id) => {
        if (id) {
          this.userId = id;
          this.loadAssignments(this.courseId, id);
        }
      });
    }
  }

  loadAssignments(courseId: number, userId: string): void {
    this.assignmentService.getAssignmentsWithStatus(courseId, +userId).subscribe({
      next: (res) => {
        this.assignments = (res.assignments || []).map((a: any) => ({
          id: +a.assignment_id, // 🔧 ensure numeric + remap
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          submission: a.submitted
            ? {
                grade: a.grade,
                feedback: a.feedback,
                url: a.submission_url,
              }
            : null,
          submissionUrl: '', // for ngModel
        }));
      },
      error: (err) => console.error('❌ Failed to fetch assignments:', err),
    });
  }

  submitAssignment(assignmentId: number, url: string): void {
    console.log('🧾 Submitting with assignmentId:', assignmentId);
    console.log('🧾 URL:', url);
    console.log('🧾 userId:', this.userId);

    this.assignmentService
      .submitAssignment({
        assignment_id: assignmentId,
        user_id: +this.userId,
        submission_url: url,
      })
      .subscribe({
        next: () => {
          alert('✅ Assignment submitted!');
          this.loadAssignments(this.courseId, this.userId); // Refresh
        },
        error: (err) => {
          console.error('❌ Submission failed:', err);
          alert('❌ Failed to submit assignment.');
        },
      });
  }
}
