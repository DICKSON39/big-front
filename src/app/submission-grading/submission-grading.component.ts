import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../services/assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submission-grading',
  templateUrl: './submission-grading.component.html',
  styleUrls: ['./submission-grading.component.css'],
  imports: [CommonModule,FormsModule]
})
export class SubmissionGradingComponent implements OnInit {
  courseId!: number;
  assignments: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
      next: (res) => {
        this.assignments = res.assignments.map((a: any) => ({
          ...a,
          submissions: [],
        }));

        this.assignments.forEach((assignment) => {
          this.assignmentService.getSubmissionsByAssignment(assignment.id).subscribe({
            next: (res) => {
              assignment.submissions = res.submissions.map((s: any) => ({
                ...s,
                gradeInput: '',
                feedbackInput: ''
              }));
            },
            error: () => {
              assignment.submissions = [];
            }
          });
        });
      },
      error: () => {
        this.snackBar.open('❌ Failed to load assignments', 'Close', { duration: 3000 });
      }
    });
  }

  grade(sub: any): void {
    if (!sub.gradeInput) {
      this.snackBar.open('Please enter a grade.', 'Close', { duration: 3000 });
      return;
    }

    this.assignmentService.gradeSubmission(sub.id, {
      grade: sub.gradeInput,
      feedback: sub.feedbackInput ?? ''
    }).subscribe({
      next: () => {
        sub.grade = sub.gradeInput;
        sub.feedback = sub.feedbackInput;
        sub.gradeInput = '';
        sub.feedbackInput = '';
        this.snackBar.open('✅ Graded successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('❌ Grading failed', 'Close', { duration: 3000 });
      }
    });
  }
}
