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
  styleUrls: ['./student-assignments.component.css'],
})
export class StudentAssignmentsComponent implements OnInit {
  assignments: any[] = [];
  userId!: string;
  courseId!: number;

  constructor(
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
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
    this.assignmentService
      .getAssignmentsWithStatus(courseId, +userId)
      .subscribe({
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

  resubmitAssignment(assignmentId: number, newUrl: string): void {
    this.assignmentService
      .resubmitAssignment({
        assignment_id: assignmentId,
        user_id: +this.userId,
        submission_url: newUrl,
      })
      .subscribe({
        next: () => {
          alert('🔁 Assignment resubmitted!');
          this.loadAssignments(this.courseId, this.userId);
        },
        error: (err) => {
          console.error('❌ Resubmission failed:', err);
          alert('❌ Failed to resubmit assignment.');
        },
      });
  }

  deleteSubmission(assignmentId: number): void {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    this.assignmentService
      .deleteSubmission(+this.userId, assignmentId)
      .subscribe({
        next: () => {
          alert('❌ Submission deleted.');
          this.loadAssignments(this.courseId, this.userId);
        },
        error: (err) => {
          console.error('❌ Deletion failed:', err);
          alert('❌ Failed to delete submission.');
        },
      });
  }
}
